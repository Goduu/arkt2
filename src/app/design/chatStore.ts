"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import { AIChat, AIMessage, ChatTag } from "@/components/chat/types";
import { ToolEvent, UsageInfo } from "@/lib/ai/aiTypes";

export interface AppStoreState {
  aiChats: Record<string, AIChat>;
  currentChatId?: string | null;
  createChat: (title?: string) => string;
  deleteChat: (chatId: string) => void;
  renameChat: (chatId: string, title: string) => void;
  setCurrentChat: (chatId: string | null) => void;
  addChatMessage: (chatId: string, message: Omit<AIMessage, 'id' | 'createdAt'>) => string;
  updateChatMessage: (chatId: string, messageId: string, content: string) => void;
  setChatMessageMeta: (chatId: string, messageId: string, meta: { tag?: ChatTag; usage?: UsageInfo | null; model?: string | null; tools?: ToolEvent[] }) => void;
}

const now = () => Date.now();

export const useChatStore = create<AppStoreState>()(
  persist(
    (set) => ({
      aiChats: {},
      currentChatId: null,
      createChat: (title?: string) => {
        const id = nanoid();
        const nowTs = now();
        set((state) => ({
          aiChats: {
            ...state.aiChats,
            [id]: { id, title: title || 'New chat', createdAt: nowTs, updatedAt: nowTs, messages: [] },
          },
          currentChatId: id,
        }));
        return id;
      },
      deleteChat: (chatId: string) => set((state) => {
        const copy = { ...state.aiChats };
        delete copy[chatId];
        const nextCurrent = state.currentChatId === chatId ? null : state.currentChatId;
        return { aiChats: copy, currentChatId: nextCurrent }
      }),
      renameChat: (chatId: string, title: string) => set((state) => {
        const chat = state.aiChats[chatId];
        if (!chat) return {}
        return { aiChats: { ...state.aiChats, [chatId]: { ...chat, title, updatedAt: now() } } }
      }),
      setCurrentChat: (chatId: string | null) => set({ currentChatId: chatId }),
      addChatMessage: (chatId: string, message: Omit<AIMessage, 'id' | 'createdAt'>) => {
        const id = nanoid();
        set((state) => {
          const chat = state.aiChats[chatId];
          if (!chat) return {}
          const next = { ...chat, updatedAt: now(), messages: [...chat.messages, { ...message, id, createdAt: now() }] };
          return { aiChats: { ...state.aiChats, [chatId]: next } }
        });
        return id;
      },
      updateChatMessage: (chatId: string, messageId: string, content: string) => set((state) => {
        const chat = state.aiChats[chatId];
        if (!chat) return {}
        const msgs = chat.messages.map((m) => (m.id === messageId ? { ...m, content } : m));
        return { aiChats: { ...state.aiChats, [chatId]: { ...chat, messages: msgs, updatedAt: now() } } }
      }),
      setChatMessageMeta: (chatId: string, messageId: string, meta: { tag?: ChatTag; usage?: UsageInfo | null; model?: string | null; tools?: ToolEvent[] }) => set((state) => {
        const chat = state.aiChats[chatId];
        if (!chat) return {}
        const msgs = chat.messages.map((m) => (m.id === messageId ? { ...m, tag: meta.tag ?? m.tag, usage: meta.usage ?? m.usage, model: meta.model ?? m.model, tools: meta.tools ?? m.tools } : m));
        return { aiChats: { ...state.aiChats, [chatId]: { ...chat, messages: msgs, updatedAt: now() } } }
      }),
    }),
    {
      name: "arkt-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ aiChats: state.aiChats, currentChatId: state.currentChatId }),
    }
  )
);


