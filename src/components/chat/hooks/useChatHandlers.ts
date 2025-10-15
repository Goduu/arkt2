"use client";

import { RefObject } from "react";
import { useChatStore } from "@/app/design/chatStore";
import { ChatTag } from "../types";
import { MentionOption } from "../chatHistory/types";
import { prepareRequestData } from "../prepareRequestData";
import { saveInteractionMetrics } from "@/lib/ai/usageHistory";
import { ArktNode } from "@/components/nodes/arkt/types";
import { NodeUnion } from "@/components/nodes/types";
import { ArktEdge } from "@/components/edges/ArktEdge/type";
import { TemplateData } from "@/components/templates/types";
import { ToolEvent, MessageMetadata } from "@/lib/ai/aiTypes";

interface UseChatHandlersParams {
  inputValue: string;
  setInputValue: (value: string) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  hasStoredKey: boolean;
  setSettingsOpen: (open: boolean) => void;
  selectedTag: ChatTag;
  mentions: MentionOption[];
  sendMessage: (message: { text: string }, options: { body: { data: unknown } }) => Promise<void>;
  assistantMsgIdRef: RefObject<string | null>;
  assistantChatIdRef: RefObject<string | null>;
  usage: MessageMetadata["usage"] | null;
  modelUsed: string | null;
  toolEvents: ToolEvent[];
  startedAt: number | null;
  endedAt: number | null;
  setEndedAt: (time: number) => void;
  resetMetadata: (startTime?: number) => void;
  nodes: NodeUnion[];
  edges: ArktEdge[];
  templates: TemplateData[];
  currentDiagramId: string | undefined;
}

export function useChatHandlers({
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
  currentDiagramId,
}: UseChatHandlersParams) {
  const addChatMessage = useChatStore((s) => s.addChatMessage);
  const renameChat = useChatStore((s) => s.renameChat);
  const setChatMessageMeta = useChatStore((s) => s.setChatMessageMeta);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const inputText = inputValue.trim();
    setInputValue("");

    if (!hasStoredKey) {
      setSettingsOpen(true);
      return;
    }

    setIsStreaming(true);
    resetMetadata(Date.now());

    try {
      const store = useChatStore.getState();
      const chatId = store.currentChatId || store.createChat("Current chat");
      store.addChatMessage(chatId, {
        role: "user",
        content: inputText,
        tag: selectedTag,
      });

      // Auto-name chat if this is the first message
      const chat = store.aiChats[chatId];
      if (chat && chat.messages.length === 0) {
        const chatName = inputText.substring(0, 20);
        if (chatName) {
          renameChat(chatId, chatName);
        }
      }

      const arktNodes = nodes.filter((node): node is ArktNode => node.type === "arktNode");
      const rootId = currentDiagramId;
      const requestData = prepareRequestData({
        rootId,
        mentions,
        tag: selectedTag,
        nodes: arktNodes,
        edges,
        nodeTemplates: templates,
      });

      const finalChatId = useChatStore.getState().currentChatId || chatId;
      const assistantInitialContent =
        (selectedTag || "").toLowerCase() === "create" ? "processing your request" : "";
      const assistantMsgId = addChatMessage(finalChatId, {
        role: "assistant",
        content: assistantInitialContent,
        tag: selectedTag,
      });
      assistantMsgIdRef.current = assistantMsgId;
      assistantChatIdRef.current = finalChatId;

      await sendMessage(
        { text: `User question:\n${inputText}` },
        {
          body: {
            data: requestData,
          },
        }
      );
      setInputValue("");

      // Persist usage/model/tool events on the assistant message
      try {
        const finishedAt = Date.now();
        const duration = (endedAt ?? finishedAt) - (startedAt ?? finishedAt);
        if (assistantChatIdRef.current && assistantMsgIdRef.current) {
          setChatMessageMeta(
            assistantChatIdRef.current,
            assistantMsgIdRef.current,
            {
              usage: usage ?? null,
              model: modelUsed ?? null,
              tools: toolEvents,
            }
          );
        }
        await saveInteractionMetrics({
          id: assistantMsgId,
          chatId: finalChatId,
          createdAt: startedAt ?? finishedAt,
          model: modelUsed ?? undefined,
          usage: usage ?? undefined,
          toolEvents: toolEvents.map(te => ({
            name: te.name,
            args: te.args,
            result: te.result,
            error: te.error,
            atMs: te.atMs,
          })),
          durationMs: Math.max(0, duration),
        });
      } catch (metricsError) {
        console.error("Failed to save interaction metrics:", metricsError);
      }
    } catch (err) {
      console.error("AI request error:", err);
      const chats = useChatStore.getState().aiChats;
      const chatId =
        assistantChatIdRef.current ||
        useChatStore.getState().currentChatId ||
        Object.keys(chats)[0] ||
        null;
      const msgId = assistantMsgIdRef.current || null;
      if (chatId && msgId) {
        try {
          useChatStore
            .getState()
            .updateChatMessage(
              chatId,
              msgId,
              "Sorry, I encountered an error while processing your request."
            );
        } catch {
          addChatMessage(chatId, {
            role: "assistant",
            content: "Sorry, I encountered an error while processing your request.",
            tag: selectedTag,
          });
        }
      } else {
        const finalChatId =
          useChatStore.getState().currentChatId || Object.keys(chats)[0] || "default";
        addChatMessage(finalChatId, {
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request.",
          tag: selectedTag,
        });
      }
    } finally {
      setIsStreaming(false);
      if (!endedAt) setEndedAt(Date.now());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    handleSendMessage,
    handleKeyDown,
  };
}

