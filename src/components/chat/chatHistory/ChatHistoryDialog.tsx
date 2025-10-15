"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { JSX, useEffect, useRef, useState } from "react";
import { History } from "lucide-react";
import { AiSettingsDialog } from "./AiSettingsDialog";
import { ChatHistoryUI } from "./ChatHistoryUI";
import { hasStoredAIKey } from "@/lib/ai/aiKey";

export function ChatHistoryDialog(): JSX.Element {
  const [hasStoredKey, setHasStoredKey] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
    }
  }, [open]);

  useEffect(() => {
    setHasStoredKey(hasStoredAIKey());
  }, []);

  useEffect(() => {
    if (open) {
      setHasStoredKey(hasStoredAIKey());
    }
  }, [open]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" data-testid="ask-ai-open" size="icon" className="gap-2 font-bold">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="ask-ai-dialog" className="sm:max-w-5xl max-h-screen overflow-y-scroll">
        <DialogHeader>
          <div className="flex items-center justify-between pr-3">
            <div className="flex flex-col">
              <DialogTitle>Chat history</DialogTitle>
              <DialogDescription>See your chat history, their token usage and models used.</DialogDescription>
            </div>
            <AiSettingsDialog hasStoredKey={hasStoredKey} setHasStoredKey={setHasStoredKey} open={settingsOpen} setOpen={setSettingsOpen} />
          </div>
        </DialogHeader>
        <div className="mb-3 h-[55vh] min-h-[280px]">
          <ChatHistoryUI />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ChatHistoryDialog;
