"use client";

import { useEffect, useRef } from "react";
import { ArrowUpIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "../ui/input-group";
import { Separator } from "../ui/separator";
import { MentionsInput } from "./chatHistory/MentionsInput";
import { MentionOption } from "./chatHistory/types";
import { ChatTag } from "./types";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isStreaming: boolean;
  selectedTag: ChatTag;
  onSelectTag: (tag: ChatTag) => void;
  mentions: MentionOption[];
  onSelectMention: (mention: MentionOption[]) => void;
  inputRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  isStreaming,
  selectedTag,
  onSelectTag,
  mentions,
  onSelectMention,
  inputRef,
}: ChatInputProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const editorRef = inputRef || internalRef;

  // Clear the DOM element when value becomes empty
  useEffect(() => {
    if (!value && editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  }, [value, editorRef]);

  const handleSend = () => {
    if (!value.trim() || isStreaming) return;
    onSend();
  };

  return (
    <InputGroup className="w-full" onKeyDown={onKeyDown}>
      <MentionsInput
        mentions={mentions}
        className="w-full p-3 py-4 min-h-[60px] max-h-[120px] overflow-y-auto"
        placeholder="Ask, Search or Chat..."
        ref={editorRef}
        onChange={(newValue, newMentions) => {
          onChange(newValue);
          onSelectMention(newMentions);
        }}
      />
      <InputGroupAddon align="block-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <InputGroupButton variant="ghost" size="sm">
              {selectedTag}
            </InputGroupButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="[--radius:0.95rem]"
          >
            <DropdownMenuItem onClick={() => onSelectTag("Ask")}>
              Ask
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectTag("Create")}>
              Create
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="!h-4 ml-auto" />
        <InputGroupButton
          variant="ghost"
          className="rounded-full"
          size="icon-sm"
          onClick={handleSend}
          disabled={!value.trim() || isStreaming}
        >
          <ArrowUpIcon
            className={cn(
              "transition-all duration-300 ease-in-out",
              isStreaming && "animate-pulse",
              isStreaming && "-rotate-90"
            )}
          />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

ChatInput.displayName = "ChatInput";