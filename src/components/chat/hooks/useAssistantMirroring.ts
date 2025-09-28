"use client";

import { useChatStore } from "@/app/design/chatStore";
import { ArktUIMessage } from "@/lib/ai/aiTypes";
import { useEffect, useRef } from "react";

export function useAssistantMirroring(
  messages: Array<ArktUIMessage> | undefined,
  assistantChatId: string | null,
  assistantMsgId: string | null
) {
  const updateChatMessage = useChatStore((s) => s.updateChatMessage);
  const lastAssistantTextRef = useRef<string>("");

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return;

    const chatId = assistantChatId;
    const msgId = assistantMsgId;
    if (!chatId || !msgId) return;

    // Gate mirroring based on the persisted tag of the assistant message
    const state = useChatStore.getState();
    const chat = state.aiChats[chatId];
    const persistedTag = chat?.messages.find(m => m.id === msgId)?.tag;
    if (persistedTag === 'Create') return;

    const textParts = (lastAssistant.parts || []).filter((p) => p?.type === 'text');
    const combined = textParts.map((p) => p.text || '').join('');
    if (combined === lastAssistantTextRef.current) return;

    updateChatMessage(chatId, msgId, combined);
    lastAssistantTextRef.current = combined;
  }, [messages, updateChatMessage, assistantChatId, assistantMsgId]);
}