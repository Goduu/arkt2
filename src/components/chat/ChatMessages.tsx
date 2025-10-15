"use client";

import { memo, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SketchyPanel } from "../sketchy/SketchyPanel";
import { useChatStore } from "@/app/design/chatStore";
import { AIMessage } from "./types";

interface ChatMessagesProps {
  isStreaming: boolean;
  assistantMsgId: string | null;
}

function TypingDots(): React.JSX.Element {
  return (
    <span className="inline-flex items-end gap-1 pl-1">
      <span
        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-duration:1s]"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-duration:1s]"
        style={{ animationDelay: "160ms" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-duration:1s]"
        style={{ animationDelay: "320ms" }}
      />
    </span>
  );
}

export const ChatMessages = memo(({ isStreaming, assistantMsgId }: ChatMessagesProps) => {
  const aiChats = useChatStore((s) => s.aiChats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messages: AIMessage[] = useMemo(() => {
    const chat = currentChatId ? aiChats[currentChatId] : undefined;
    return chat?.messages ?? [];
  }, [aiChats, currentChatId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    requestAnimationFrame(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    });
  }, [messages.length]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-4">
        No messages yet. Start a conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
      {messages.map((message) => {
        const isCurrentStreaming = isStreaming && message.id === assistantMsgId;
        return (
          <div
            key={message.id}
            className={cn(
              "max-w-[85%]",
              message.role === "user" ? "ml-auto" : "mr-auto"
            )}
          >
            <SketchyPanel
              seed={2}
              strokeColor={
                message.role === "user"
                  ? { family: "lime", indicative: "low" }
                  : { family: "gray", indicative: "low" }
              }
              className="p-3"
            >
              <div className="text-[10px] text-muted-foreground mb-1 font-medium">
                {message.role === "user" ? "You" : "Assistant"} •{" "}
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
              <div className="break-words text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
                {isCurrentStreaming && <TypingDots />}
              </div>
            </SketchyPanel>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
});

ChatMessages.displayName = "ChatMessages";

