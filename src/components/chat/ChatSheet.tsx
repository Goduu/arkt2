"use client";

import Image from "next/image";
import { useMemo, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { ChatControls } from "./ChatControls";
import { useChatSession } from "./hooks/useChatSession";
import { useChatHandlers } from "./hooks/useChatHandlers";
import { useAssistantMirroring } from "./hooks/useAssistantMirroring";
import { useMessageMetadata } from "./hooks/useMessageMetadata";
import { useAiCreateStreaming } from "./useAiCreateStreaming";
import { useMentionOptions } from "./hooks/useMentionOptions";
import { useChatStore } from "@/app/design/chatStore";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ArktUIMessage } from "@/lib/ai/aiTypes";
import { nodesMap, edgesMap } from "./ydocMaps";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";
import useUserDataStateSynced from "../yjs/useUserStateSynced";
import { useTheme } from "next-themes";
import { useMounted } from "@/app/useMounted";
import { cn } from "@/lib/utils";

export function ChatSheet() {
  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());
  const [templates] = useTemplatesStateSynced();
  const { currentUserData } = useUserDataStateSynced();
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  // Session state
  const {
    isOpen,
    setIsOpen,
    selectedTag,
    setSelectedTag,
    inputValue,
    setInputValue,
    isStreaming,
    setIsStreaming,
    hasStoredKey,
    setHasStoredKey,
    settingsOpen,
    setSettingsOpen,
    mentions,
    setMentions,
    inputRef,
  } = useChatSession();

  // AI transport and streaming
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/ai-create" }),
    []
  );
  const { messages: sdkMessages, sendMessage } = useChat<ArktUIMessage>({ transport });
  const assistantMsgIdRef = useRef<string | null>(null);
  const assistantChatIdRef = useRef<string | null>(null);
  const lastAppendedForMsgIdRef = useRef<string | null>(null);

  const {
    usage,
    modelUsed,
    toolEvents,
    startedAt,
    endedAt,
    setEndedAt,
    resetMetadata,
  } = useMessageMetadata(sdkMessages);

  // Mention options
  const mentionOptions = useMentionOptions();

  // Message handlers
  const { handleSendMessage, handleKeyDown } = useChatHandlers({
    inputValue,
    setInputValue,
    isStreaming,
    setIsStreaming,
    hasStoredKey,
    setSettingsOpen,
    selectedTag,
    mentions,
    sendMessage,
    assistantMsgIdRef,
    assistantChatIdRef,
    usage,
    modelUsed,
    toolEvents,
    startedAt,
    endedAt,
    setEndedAt,
    resetMetadata,
    nodes,
    edges,
    templates,
    currentDiagramId: currentUserData?.currentDiagramId,
  });

  // Mirror assistant streaming content into store messages
  useAssistantMirroring(
    sdkMessages,
    assistantChatIdRef.current,
    assistantMsgIdRef.current
  );

  // Handle streaming and application effects
  useAiCreateStreaming({
    sdkMessages,
    toolEvents,
    endedAt,
    assistantChatIdRef,
    assistantMsgIdRef,
  });

  // For Create-tagged assistant message: keep placeholder and append 'done' when streaming completes
  useEffect(() => {
    const chatId = assistantChatIdRef.current;
    const msgId = assistantMsgIdRef.current;
    if (!chatId || !msgId) return;

    const state = useChatStore.getState();
    const chat = state.aiChats[chatId];
    const message = chat?.messages.find((m) => m.id === msgId);
    const persistedTag = message?.tag;

    if (persistedTag !== "Create") return;

    if (isStreaming) {
      try {
        useChatStore
          .getState()
          .updateChatMessage(chatId, msgId, "processing your request");
      } catch {
        console.error("Failed to update chat message");
      }
      return;
    }
    if (!endedAt) return;
    if (lastAppendedForMsgIdRef.current === msgId) return;

    const existing = message?.content ?? "";
    const alreadyHasDone = /(^|\n)done$/.test(existing.trim());
    if (alreadyHasDone) {
      lastAppendedForMsgIdRef.current = msgId;
      return;
    }
    const suffix =
      existing.endsWith("\n") || existing.length === 0 ? "done" : "\ndone";
    state.updateChatMessage(chatId, msgId, `${existing}${suffix}`);
    lastAppendedForMsgIdRef.current = msgId;

    // Auto-close sheet after Create mode completes to show the diagram
    const timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isStreaming, endedAt, setIsOpen]);

  // Persist metadata as it streams
  const setChatMessageMeta = useChatStore((s) => s.setChatMessageMeta);
  useEffect(() => {
    const chatId = assistantChatIdRef.current;
    const msgId = assistantMsgIdRef.current;
    if (!chatId || !msgId) return;
    const hasAnyMeta = !!(
      usage ||
      modelUsed ||
      (toolEvents && toolEvents.length > 0)
    );
    if (!hasAnyMeta) return;
    setChatMessageMeta(chatId, msgId, {
      tag: selectedTag,
      usage: usage ?? null,
      model: modelUsed ?? null,
      tools: toolEvents,
    });
  }, [usage, modelUsed, toolEvents, setChatMessageMeta, selectedTag]);

  // Handle tag changes - create new chat if tag changes and there are messages
  const handleSelectTag = (tag: typeof selectedTag) => {
    if (tag !== selectedTag && sdkMessages.length > 0) {
      const newChatId = useChatStore.getState().createChat("Current chat");
      useChatStore.getState().setCurrentChat(newChatId);
    }
    setSelectedTag(tag);
  };

  return (
    <div
      className={cn(
        "hidden md:block fixed bottom-4 right-4 z-50",
        isOpen && "pointer-events-none"
      )}
    >
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetDescription hidden>Chat</SheetDescription>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            fillColor={{ family: "lime", indicative: "middle" }}
            className="pointer-events-auto shadow-lg"
            data-testid="chat-sheet-trigger"
          >
            {mounted && (
              <Image
                src={`/arkt-logo-${resolvedTheme}.svg`}
                alt="ArkT"
                width={32}
                height={32}
              />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col p-0 gap-0"
        >
          <SheetHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Chat</SheetTitle>
              <ChatControls
                hasStoredKey={hasStoredKey}
                setHasStoredKey={setHasStoredKey}
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
              />
            </div>
          </SheetHeader>
          <ChatMessages
            isStreaming={isStreaming}
            assistantMsgId={assistantMsgIdRef.current}
          />
          <SheetFooter className="p-4 pt-2 border-t mt-0">
            <ChatInput
              inputRef={inputRef}
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              onKeyDown={handleKeyDown}
              isStreaming={isStreaming}
              selectedTag={selectedTag}
              onSelectTag={handleSelectTag}
              mentions={mentionOptions}
              onSelectMention={setMentions}
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}