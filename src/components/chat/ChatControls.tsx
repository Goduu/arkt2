"use client";

import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import { AiSettingsDialog } from "./chatHistory/AiSettingsDialog";
import ChatHistoryDialog from "./chatHistory/ChatHistoryDialog";

interface ChatControlsProps {
  hasStoredKey: boolean;
  setHasStoredKey: (value: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

export function ChatControls({
  hasStoredKey,
  setHasStoredKey,
  settingsOpen,
  setSettingsOpen,
}: ChatControlsProps) {
  return (
    <div className="flex items-center gap-2 pr-10">
      <ChatHistoryDialog />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSettingsOpen(true)}
        data-testid="chat-settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
      <AiSettingsDialog
        hideTrigger
        hasStoredKey={hasStoredKey}
        setHasStoredKey={setHasStoredKey}
        open={settingsOpen}
        setOpen={setSettingsOpen}
      />
    </div>
  );
}

ChatControls.displayName = "ChatControls";

