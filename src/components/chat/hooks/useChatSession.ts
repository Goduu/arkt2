"use client";

import { useState, useEffect, useRef } from "react";
import { hasStoredAIKey } from "@/lib/ai/aiKey";
import { useCommandStore } from "@/app/design/commandStore";
import { ChatTag } from "../types";
import { MentionOption } from "../chatHistory/types";

export function useChatSession() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ChatTag>("Ask");
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [mentions, setMentions] = useState<MentionOption[]>([]);
  const inputRef = useRef<HTMLDivElement | null>(null);

  const openAskAiCommand = useCommandStore((s) => s.commandMap["open-ask-ai"]);
  const removeCommand = useCommandStore((s) => s.removeCommand);

  // Command store listener - open sheet when command is triggered
  useEffect(() => {
    if (openAskAiCommand.status === "pending") {
      setIsOpen(true);
      removeCommand("open-ask-ai");
    }
  }, [openAskAiCommand, removeCommand]);

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
    const onKeyUpdated = () => {
      setHasStoredKey(hasStoredAIKey());
    };
    window.addEventListener("arkt:key-updated", onKeyUpdated);
    return () => window.removeEventListener("arkt:key-updated", onKeyUpdated);
  }, []);

  return {
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
  };
}

