"use client";

import { RefObject, useState } from "react";
import { Button } from "../ui/button";
import { RefreshCcwDot, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MentionOption } from "./chatHistory/types";
import { MentionsInput } from "./chatHistory/MentionsInput";
import { ChatTag } from "./types";

interface ChatInputProps {
    ref: RefObject<HTMLDivElement | null>;
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    isStreaming: boolean;
    selectedTag: ChatTag | null;
    onSelectTag: (tag: ChatTag) => void;
    mentions: MentionOption[];
    onSelectMention: (mention: MentionOption[]) => void;
}

export const ChatInput = (
    { ref: inputRef, value, onChange, onSend, isStreaming, selectedTag, onSelectTag, mentions, onSelectMention }: ChatInputProps) => {
    const [open, setOpen] = useState(false);

    const handleClick = (tag: ChatTag) => {
        onSelectTag(tag);
        setOpen(false);
    }

    const handleSend = () => {
        onSend();
        if (inputRef.current?.innerHTML) {
            inputRef.current.innerHTML = "";
        }
    }

    return (
        <>
            {selectedTag && (
                <div className="flex items-center gap-1 px-1 py-1 ml-1 rounded-xs mr-2">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger className="w-16" asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                fillColor={{ family: "gray", indicative: "low" }}
                                className="group pr-0 flex items-center justify-between gap-1 text-xs font-medium text-gray-700 capitalize">
                                {selectedTag}
                                <RefreshCcwDot
                                    className="text-current/70 group-hover:opacity-100 opacity-30 shrink-0 transition-transform duration-300 size-3" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-36">
                            <div className="h-7 flex items-center gap-2 rounded-xs px-0 py-0 ">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    fillColor={{ family: "lime", indicative: "low" }}
                                    onClick={() => handleClick("Ask")}
                                    className="h-full w-full text-xs font-medium text-gray-700 hover:text-gray-900"
                                >
                                    Ask
                                </Button>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    fillColor={{ family: "purple", indicative: "low" }}
                                    onClick={() => handleClick("Create")}
                                    className="h-full w-full text-xs font-medium text-gray-700 hover:text-gray-900"
                                >
                                    Create
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                </div>
            )}
            <MentionsInput
                mentions={mentions}
                className="w-44"
                ref={inputRef}
                onChange={(value, mentions) => {
                    onChange(value);
                    onSelectMention(mentions);
                }}
            />
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSend}
                    disabled={!value.trim() || isStreaming}
                    className="h-8 w-8 mr-1"
                    data-testid="chat-send"
                >
                    <SendHorizontal
                        className={cn(
                            "size-4 transition-all duration-300 ease-in-out",
                            isStreaming && "animate-pulse",
                            isStreaming && "-rotate-90"
                        )}
                    />
                </Button>
            </div>
        </>
    );
};

ChatInput.displayName = "ChatInput";


