"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { SketchyPanel } from "../sketchy/SketchyPanel";

export interface ChatMessageItem {
    id: string;
    content: string;
    type: "user" | "ai";
    isStreaming?: boolean;
}

interface MessageListProps {
    messages: ChatMessageItem[];
    isStreaming: boolean;
}

export const MessageList = memo(({ messages, isStreaming }: MessageListProps) => {
    if (!messages || messages.length === 0) return null;

    return (
        <div className="mb-2 max-w-96 space-y-2">
            {messages.map((message, index) => (
                <div
                    key={message.id}
                    className={cn(
                        "rounded-lg px-3 py-2 text-sm transition-all duration-1000 ease-in-out",
                        isStreaming && index === 0 && "transform scale-95",
                        messages.length > 2 && index < messages.length - 2 && "opacity-0 hidden",
                        message.type === "user" ? "ml-10" : "mr-10"
                    )}
                >
                    <SketchyPanel
                        seed={2}
                        fillWeight={3.05}
                        fillStyle="dots"
                        fillColor={message.type === "user" ? { family: "lime", indicative: "low" } : { family: "gray", indicative: "low" }}
                        strokeColor={message.type === "user" ? { family: "lime", indicative: "low" } : { family: "gray", indicative: "low" }}
                    >
                        <div className="break-words text-white font-bold">
                            {message.content || (message.isStreaming ? "..." : "")}
                            {message.isStreaming && (
                                <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
                            )}
                        </div>
                    </SketchyPanel>
                </div>
            ))}
        </div>
    );
})

MessageList.displayName = "MessageList";


