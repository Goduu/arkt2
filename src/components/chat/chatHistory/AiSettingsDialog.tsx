"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "../../ui/input";
import { clearAIKey, encryptAndSaveAIKey } from "@/lib/ai/aiKey";


type AiSettingsDialogProps = {
    hasStoredKey: boolean;
    setHasStoredKey: (hasStoredKey: boolean) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    hideTrigger?: boolean;
}

export function AiSettingsDialog({ hasStoredKey, setHasStoredKey, open, setOpen, hideTrigger }: AiSettingsDialogProps) {
    const [apiKeyInput, setApiKeyInput] = useState<string>("");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <UIButton size="icon" variant="ghost" title="AI Settings" aria-label="AI Settings">
                        <Settings className="h-4 w-4" />
                    </UIButton>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>AI Settings</DialogTitle>
                    <DialogDescription>Configure your OpenAI key. It is encrypted and stored locally; only encrypted data is sent to the API.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="text-sm font-medium">OpenAI Key</div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="password"
                            className=" rounded border px-2 py-1 bg-transparent"
                            placeholder={hasStoredKey ? "Key saved (hidden)" : "Enter your key"}
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                        />
                        <UIButton
                            className=""
                            size="sm"
                            variant="outline"
                            disabled={!apiKeyInput}
                            onClick={async () => { await encryptAndSaveAIKey(apiKeyInput); setApiKeyInput(""); setHasStoredKey(true); }}
                        >
                            Save
                        </UIButton>
                    </div>
                    <DialogFooter className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Send is disabled until a key is set.</div>
                        <UIButton size="sm" variant="ghost" disabled={!hasStoredKey} onClick={() => { clearAIKey(); setHasStoredKey(false); }}>Clear</UIButton>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}