"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { Input } from "../../ui/input";
import { DetailsBar } from "./DetailsBar";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { useChatStore } from "@/app/design/chatStore";

function TypingDots(): React.JSX.Element {
  return (
    <span className="inline-flex items-end gap-1 pl-1">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-duration:1s]" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-duration:1s]" style={{ animationDelay: "160ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-duration:1s]" style={{ animationDelay: "320ms" }} />
    </span>
  );
}

export function ChatHistoryUI() {
  const chats = useChatStore((s) => s.aiChats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const setCurrentChat = useChatStore((s) => s.setCurrentChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const renameChat = useChatStore((s) => s.renameChat);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  const chatList = useMemo(() => Object.values(chats).sort((a, b) => b.updatedAt - a.updatedAt), [chats]);
  const active = currentChatId ? chats[currentChatId] : chatList[0];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const lastMessage = active?.messages[active.messages.length - 1];
  const isAssistantStreaming = !!(lastMessage && lastMessage.role === 'assistant' && !lastMessage.usage);

  // Always keep the view scrolled to the last message
  useEffect(() => {
    requestAnimationFrame(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    });
  }, [active?.id, active?.messages.length, lastMessage?.content]);

  return (
    <div className="grid grid-cols-[240px_1fr] gap-3 h-full min-h-0">
      <SketchyPanel className=" bg-card p-2 h-full flex flex-col ">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Chats</div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {chatList.map((chat) => (
            <SketchyPanel
              key={chat.id}
              strokeWidth={active?.id === chat.id ? 3 : 2}
              strokeColor={active?.id === chat.id ? { family: "slate", indicative: "middle" } : undefined}
              hoverEffect
              className="py-2 px-4"
            >
              <div data-testid="chat-item" className={`group rounded-md text-sm cursor-pointer`} onClick={() => setCurrentChat(chat.id)}>
                {renamingId === chat.id ? (
                  <Input
                    className="w-full px-1 py-px bg-transparent"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => { renameChat(chat.id, renameValue.trim() || chat.title); setRenamingId(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenamingId(null); }}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="truncate" title={chat.title}>{chat.title}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      <Button data-testid="chat-rename" size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setRenamingId(chat.id); setRenameValue(chat.title); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button data-testid="chat-delete" size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground">{new Date(chat.updatedAt).toLocaleString()}</div>
              </div>
            </SketchyPanel>
          ))}
          {chatList.length === 0 && (
            <div className="text-xs text-muted-foreground p-4 text-center">No chats yet. Start one!</div>
          )}
        </div>
      </SketchyPanel>
      <SketchyPanel className="flex-1 rounded-md bg-card py-2 px-4 h-full min-h-0 flex flex-col">
        {!active ? (
          <div className="text-sm text-muted-foreground">Select a chat to see the history.</div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {active.messages.map((message) => (
                <SketchyPanel key={message.id} className={`max-w-[80%] rounded-md py-2 px-4 ${message.role === 'user' ? 'ml-auto bg-primary/5' : 'mr-auto bg-muted/40'}`}>
                  <div className="text-[11px] text-muted-foreground mb-1">{message.role === 'user' ? 'You' : 'Assistant'} • {new Date(message.createdAt).toLocaleTimeString()}</div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed" data-testid={`${message.role}-message`}>
                    {message.content}
                    {message.role === 'assistant' && isAssistantStreaming && message.id === lastMessage?.id && (
                      <TypingDots />
                    )}
                  </div>
                  {message.role === 'assistant' && (message.usage || message.model || (message.tools && message.tools.length > 0)) && (
                    <div className="mt-2">
                      <DetailsBar usage={message.usage ?? null} modelUsed={message.model ?? null} toolEvents={message.tools ?? []} startedAt={null} endedAt={null} />
                    </div>
                  )}
                </SketchyPanel>
              ))}
              {active.messages.length === 0 && (
                <div className="text-sm text-muted-foreground">No messages yet.</div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        )}
      </SketchyPanel>
    </div>
  );
}


