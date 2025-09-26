import { useChatStore } from "@/app/design/chatStore";
import { Edit, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";


export const ChatHistoryPopover = () => {
  const [chatSearch, setChatSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const { aiChats, setCurrentChat, currentChatId, createChat } = useChatStore();
  const renameChat = useChatStore((s) => s.renameChat);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  const chatSearchResults = useMemo(() => {
    return Object.values(aiChats).filter((chat) => chat.title.toLowerCase().includes(chatSearch.toLowerCase()));
  }, [aiChats, chatSearch]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) setChatSearch("");
  }

  const handleNewChat = () => {
    createChat();
    setOpen(false);
  }

  return (
    <div className="gap-2 flex flex-col">
      <div className="flex items-center gap-2 relative max-w-xl">
        <Popover open={open} onOpenChange={handleOpenChange} >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-48 justify-between outline-ring/0 focus-visible:ring-ring/0"
            >
              <span className="flex items-center gap-2 text-sm truncate">
                <Search className="size-4 " />
                {chatSearch ? `Results for "${chatSearch}"` : "Search chats..."}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Type to search..."
                value={chatSearch || ""}
                onValueChange={setChatSearch}
                className="h-8"
              />
              <CommandList>
                {chatSearchResults.length === 1231 ? (
                  <NewChatCommandItem onNewChat={handleNewChat} />
                ) : (
                  <CommandGroup>
                    {chatSearchResults.map((chat) => {
                      const isActive = chat.id === currentChatId;
                      return (
                        <CommandItem
                        className="w-40"
                          key={`${chat.id}`}
                          value={chat.id}
                          onSelect={() => {
                            setCurrentChat(chat.id);
                            setOpen(false);
                          }}
                        >

                          {renamingId === chat.id ? (
                            <Input
                              className="w-full h-7 text-xs"
                              value={renameValue}
                              autoFocus
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => {
                                const next = renameValue.trim() || chat.title;
                                if (next !== chat.title) renameChat(chat.id, next);
                                setRenamingId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                if (e.key === "Escape") setRenamingId(null);
                              }}
                            />
                          ) : (
                            <Button
                              strokeColor={{ family: "white", indicative: "middle" }}
                              className="w-full"
                              size="sm"
                              variant="ghost"
                              fillColor={isActive ? { family: "lime", indicative: "low" } : undefined}
                            >
                              <div className="font-medium truncate">{chat.title}</div>
                            </Button>
                          )}
                          <Button
                            fillColor={{ family: "lime", indicative: "low" }}
                            data-testid="chat-rename"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setRenamingId(chat.id);
                              setRenameValue(chat.title);
                            }}>
                            <Edit className="size-4" />
                          </Button>
                        </CommandItem>
                      );
                    })}
                    <NewChatCommandItem onNewChat={handleNewChat} />
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div >
    </div >
  );
};

type NewChatCommandItemProps = {
  onNewChat: () => void
}

const NewChatCommandItem = ({ onNewChat }: NewChatCommandItemProps) => {
  return (
    <CommandItem onSelect={onNewChat}>
      <Button
        strokeColor={{ family: "white", indicative: "middle" }}
        className="w-40"
        variant="ghost"
        size="sm"
      >
        <div className="flex items-center gap-2 font-bold truncate">
          <Plus className="size-5 " />
          New Chat
        </div>
      </Button>
    </CommandItem>

  )
}