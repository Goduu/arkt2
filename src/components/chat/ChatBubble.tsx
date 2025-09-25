"use client";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "../../lib/utils";
import { PanelTopClose, PanelTopOpen } from "lucide-react";
import { useChatStore as useChatStore } from "@/app/design/chatStore";
import { hasStoredAIKey } from "@/lib/ai/aiKey";
import { DefaultChatTransport, UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useAssistantMirroring } from "./hooks/useAssistantMirroring";
import { useMessageMetadata } from "./hooks/useMessageMetadata";
import { MessageList } from "./MessageList";
import type { ChatMessageItem } from "./MessageList";
import { ActionBar } from "./ActionBar";
import { ChatInput } from "./ChatInput";
import { AiSettingsDialog } from "./chatHistory/AiSettingsDialog";
import { MentionOption } from "./chatHistory/types";
import { useMentionOptions } from "./hooks/useMentionOptions";
import { ChatTag } from "./types";
import { prepareRequestData } from "./prepareRequestData";
import useEdgesStateSynced from "../yjs/useEdgesStateSynced";
import useNodesStateSynced from "../yjs/useNodesStateSynced";
import { saveInteractionMetrics } from "@/lib/ai/usageHistory";
import { useUserDataStateSynced } from "../yjs/useUserStateSynced";
import { DEFAULT_PATH_ID } from "../yjs/constants";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";
import { useTheme } from "next-themes";
import { useMounted } from "@/app/useMounted";

type Message = ChatMessageItem

export function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showActionBar, setShowActionBar] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ChatTag>("Ask");
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [hasStoredKey, setHasStoredKey] = useState<boolean>(false);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [mentions, setMentions] = useState<MentionOption[]>([]);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const [, setNodes] = useNodesStateSynced()
    const [, setEdges] = useEdgesStateSynced()

    // App state and chat actions
    const aiChats = useChatStore((s) => s.aiChats);
    const currentChatId = useChatStore((s) => s.currentChatId);
    const { currentUserData } = useUserDataStateSynced();
    const currentDiagramId = currentUserData?.currentDiagramId;
    const rootId = DEFAULT_PATH_ID
    const [templates] = useTemplatesStateSynced();
    const addChatMessage = useChatStore((s) => s.addChatMessage);
    const setChatMessageMeta = useChatStore((s) => s.setChatMessageMeta);
    const renameChat = useChatStore((s) => s.renameChat);
    const { resolvedTheme } = useTheme()
    const mounted = useMounted()

    // AI transport and streaming
    const transport = useMemo(() => new DefaultChatTransport({ api: "/api/ai-create" }), []);
    const { messages: sdkMessages, sendMessage } = useChat<UIMessage>({ transport });
    const assistantMsgIdRef = useRef<string | null>(null);
    const assistantChatIdRef = useRef<string | null>(null);
    const { usage, modelUsed, toolEvents, startedAt, endedAt, setEndedAt, resetMetadata } = useMessageMetadata(sdkMessages);
    // Streaming state handled by useAiCreateStreaming
    const lastAppendedForMsgIdRef = useRef<string | null>(null);

    // Derived messages for UI from store
    const derivedMessages: Message[] = useMemo(() => {
        const chat = currentChatId ? aiChats[currentChatId] : undefined;
        const list = chat?.messages ?? [];
        return list.map((m) => ({ id: m.id, content: m.content, type: m.role === 'user' ? 'user' : 'ai', isStreaming: isStreaming && m.id === assistantMsgIdRef.current }));
    }, [aiChats, currentChatId, isStreaming]);

    // Send message to AI route with context and tag
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isStreaming) return;

        if (!hasStoredKey) {
            setSettingsOpen(true);
            return;
        }

        setShowMessages(true);
        setIsStreaming(true);
        resetMetadata(Date.now());
        try {
            const store = useChatStore.getState();
            const chatId = store.currentChatId || store.createChat('New chat');
            store.addChatMessage(chatId, { role: 'user', content: inputValue, tag: selectedTag });

            // Auto-name chat if this is the first message
            const chat = store.aiChats[chatId];
            if (chat && chat.messages.length === 0) {
                const chatName = inputValue.trim().substring(0, 20);
                if (chatName) {
                    renameChat(chatId, chatName);
                }
            }

            const activeId = currentDiagramId
            const payloadRootId = activeId || rootId;
            const requestData = prepareRequestData(payloadRootId, mentions, selectedTag, templates);

            const finalChatId = useChatStore.getState().currentChatId || chatId;
            const assistantInitialContent = ((selectedTag || '').toLowerCase() === 'create') ? 'processing your request' : '';
            const assistantMsgId = addChatMessage(finalChatId, { role: 'assistant', content: assistantInitialContent, tag: selectedTag });
            assistantMsgIdRef.current = assistantMsgId;
            assistantChatIdRef.current = finalChatId;

            await sendMessage(
                { text: `User question:\n${inputValue}` },
                {
                    body: {
                        data: requestData
                    }
                }
            );
            setInputValue("");

            // Persist usage/model/tool events on the assistant message
            try {
                const finishedAt = Date.now();
                const duration = (endedAt ?? finishedAt) - (startedAt ?? finishedAt);
                if (assistantChatIdRef.current && assistantMsgIdRef.current) {
                    setChatMessageMeta(assistantChatIdRef.current, assistantMsgIdRef.current, { usage: usage ?? null, model: modelUsed ?? null, tools: toolEvents });
                }
                await saveInteractionMetrics({
                    id: assistantMsgId,
                    chatId: finalChatId,
                    createdAt: startedAt ?? finishedAt,
                    model: modelUsed,
                    usage: usage ?? undefined,
                    toolEvents: toolEvents,
                    durationMs: Math.max(0, duration),
                });
            } catch (metricsError) {
                console.error('Failed to save interaction metrics:', metricsError);
            }
        } catch (err) {
            console.error("AI request error:", err);
            const chats = useChatStore.getState().aiChats;
            const chatId = assistantChatIdRef.current || useChatStore.getState().currentChatId || Object.keys(chats)[0] || null;
            const msgId = assistantMsgIdRef.current || null;
            if (chatId && msgId) {
                try {
                    useChatStore.getState().updateChatMessage(chatId, msgId, 'Sorry, I encountered an error while processing your request.');
                } catch {
                    addChatMessage(chatId, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.', tag: selectedTag });
                }
            } else {
                const finalChatId = useChatStore.getState().currentChatId || Object.keys(chats)[0] || 'default';
                addChatMessage(finalChatId, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.', tag: selectedTag });
            }
        } finally {
            setIsStreaming(false);
            if (!endedAt) setEndedAt(Date.now());
            setInputValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handlePanelButtonClick = () => {
        setShowActionBar(!showActionBar);
    };

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Key management
    useEffect(() => {
        setHasStoredKey(hasStoredAIKey());
    }, []);

    useEffect(() => {
        const onKeyUpdated = () => setHasStoredKey(hasStoredAIKey());
        window.addEventListener('arkt:key-updated', onKeyUpdated as EventListener);
        return () => window.removeEventListener('arkt:key-updated', onKeyUpdated as EventListener);
    }, []);

    // Mirror assistant streaming content into store messages based on persisted tag
    useAssistantMirroring(sdkMessages, assistantChatIdRef.current, assistantMsgIdRef.current);
    // For Create tag: keep placeholder and append a trailing newline + 'done' when streaming completes
    // For Create-tagged assistant message: keep placeholder and append 'done' when streaming completes
    useEffect(() => {
        const chatId = assistantChatIdRef.current;
        const msgId = assistantMsgIdRef.current;
        if (!chatId || !msgId) return;

        const state = useChatStore.getState();
        const chat = state.aiChats[chatId];
        const message = chat?.messages.find((m) => m.id === msgId);
        const persistedTag = message?.tag;

        if (persistedTag !== 'Create') return;

        if (isStreaming) {
            try {
                useChatStore.getState().updateChatMessage(chatId, msgId, 'processing your request');
            } catch {
                // no-op
            }
            return;
        }
        if (!endedAt) return;
        if (lastAppendedForMsgIdRef.current === msgId) return;

        const existing = message?.content ?? '';
        const alreadyHasDone = /(^|\n)done$/.test(existing.trim());
        if (alreadyHasDone) {
            lastAppendedForMsgIdRef.current = msgId;
            return;
        }
        const suffix = existing.endsWith('\n') || existing.length === 0 ? 'done' : '\ndone';
        state.updateChatMessage(chatId, msgId, `${existing}${suffix}`);
        lastAppendedForMsgIdRef.current = msgId;
    }, [isStreaming, endedAt]);

    // Persist metadata as it streams (not displayed here)
    useEffect(() => {
        const chatId = assistantChatIdRef.current;
        const msgId = assistantMsgIdRef.current;
        if (!chatId || !msgId) return;
        const hasAnyMeta = !!(usage || modelUsed || (toolEvents && toolEvents.length > 0));
        if (!hasAnyMeta) return;
        setChatMessageMeta(chatId, msgId, { tag: selectedTag, usage: usage ?? null, model: modelUsed ?? null, tools: toolEvents });
    }, [usage, modelUsed, toolEvents, setChatMessageMeta]);

    // Handle streaming and application effects via extracted hook
    // useAiCreateStreaming({ sdkMessages, toolEvents, endedAt, setNodes, setEdges, assistantChatIdRef, assistantMsgIdRef });

    const messageListProps = useMemo(() => ({
        messages: derivedMessages.slice(-4),
        isStreaming
    }), [derivedMessages, isStreaming]);

    const mentionOptions = useMentionOptions(currentDiagramId);

    const handleSelectTag = (tag: ChatTag) => {
        // create a new chat if the tag is changed
        if (tag !== selectedTag && sdkMessages.length > 0) {
            const newChatId = useChatStore.getState().createChat('New chat');
            useChatStore.getState().setCurrentChat(newChatId);
        }
        setSelectedTag(tag);
    }

    return (
        <div className={cn(
            "absolute bottom-2 right-0 transition-all duration-300 ease-in-out",
            isOpen ? 'w-96' : 'w-15'
        )} data-testid="chat-bubble">
            {/* Messages Display */}
            {showMessages && derivedMessages.length > 0 && (
                <MessageList {...messageListProps} />
            )}

            {/* Action Bar */}
            {showActionBar && (
                <ActionBar />
            )}

            {/* Input Container */}
            <div className={cn("flex items-center justify-center gap-0 rounded-xs shadow-xs border-gray-200 overflow-hidden transition-all duration-300 ease-in-out", !isOpen && "w-15")}>
                <Button
                    variant="ghost"
                    size="icon"
                    fillColor={{ family: "lime", indicative: "middle" }}
                    onClick={() => {
                        setIsOpen(!isOpen)
                        setShowMessages(false)
                        setShowActionBar(false)
                    }}
                    className="flex-shrink-0"
                >
                    {mounted && <Image src={`/arkt-logo-${resolvedTheme}.svg`} alt="ArkT" width={32} height={32} />}
                </Button>
                {isOpen && (
                    <div
                        className={cn(
                            isOpen ? 'w-80' : 'w-0'
                        )}
                    >
                        <div className="flex items-center justify-between w-full">
                            <ChatInput
                                ref={inputRef}
                                value={inputValue}
                                onChange={setInputValue}
                                onKeyDown={handleKeyDown}
                                onSend={handleSendMessage}
                                isStreaming={isStreaming}
                                selectedTag={selectedTag}
                                onSelectTag={handleSelectTag}
                                mentions={mentionOptions}
                                onSelectMention={setMentions}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                fillColor={{ family: "lime", indicative: "middle" }}
                                onClick={handlePanelButtonClick}
                                className="h-8 w-8 mr-1"
                                data-testid="chat-panel-toggle"
                            >
                                {showMessages && (
                                    <PanelTopOpen className="size-4" />
                                )}
                                {!showMessages && (
                                    <PanelTopClose className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <AiSettingsDialog hideTrigger hasStoredKey={hasStoredKey} setHasStoredKey={setHasStoredKey} open={settingsOpen} setOpen={setSettingsOpen} />
        </div>
    );
}