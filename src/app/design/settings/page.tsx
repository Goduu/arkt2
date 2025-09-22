"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, LogOut, ShieldCheck, ShieldAlert, Info, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { clearAIKey, encryptAndSaveAIKey, hasStoredAIKey } from "@/lib/ai/aiKey";
import { DEFAULT_STROKE_COLOR } from "@/components/colors/utils";

export default function SettingsPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [hasStoredKey, setHasStoredKey] = useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/github/token/status", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setConnected(Boolean(data?.connected));
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    setHasStoredKey(hasStoredAIKey());
  }, []);

  const handleDisconnect = async () => {
    try {
      await fetch("/api/github/logout", { method: "POST" });
      await refresh();
    } catch { 
      console.warn("Error disconnecting from GitHub");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        {/* <p className="text-sm text-muted-foreground">GitHub connection is used only to securely fetch private repository files into previews. No other actions are performed.</p> */}
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Github</h2>
        <p className="text-sm text-muted-foreground">GitHub connection is used only to securely fetch files into previews or to give more context to the AI. No other actions are performed.</p>
      </div>

      <SketchyPanel>
        <div className="text-card-foreground">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${connected ? "text-green-600" : "text-amber-600"}`}>
                {connected ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-base font-medium flex items-center gap-2">
                  GitHub Access {connected ? <span className="text-xs text-muted-foreground font-normal">connected</span> : <span className="text-xs text-muted-foreground font-normal">not connected</span>}
                </h2>
                <p className="text-sm text-muted-foreground">
                  We request minimal permissions to read private repository contents. Your access tokens are securely stored as HTTP-only cookies and are only used to fetch files from GitHub repositories you explicitly link to.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connected ? (
                <Button variant="outline" onClick={handleDisconnect} disabled={loading}>
                  <LogOut className="h-4 w-4 mr-2" /> Disconnect
                </Button>
              ) : (
                <Button variant="outline">
                  <Link className="flex items-center gap-2" href="/api/github/oauth/start">
                    <Github className="h-4 w-4 mr-2" /> Connect GitHub
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </SketchyPanel>

      <SketchyPanel strokeColor={DEFAULT_STROKE_COLOR}>
        <div>
          <div className="p-4 text-xs text-muted-foreground">
            By connecting, you authorize this app to fetch raw file contents from repositories you have access to. No write actions are performed. You can revoke access anytime from this page or in your GitHub account settings.
          </div>
        </div>
      </SketchyPanel>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          Open AI Key
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground">
            <Info className="h-4 w-4" />
          </a>
        </h2>
        <p className="text-sm text-muted-foreground">Configure your OpenAI key. It is encrypted and stored locally; only encrypted data is sent to the API.</p>
      </div>
      <div className="flex gap-4 items-center justify-between">
        <div className="w-5/6">

          <Input
            type="password"
            className="rounded px-2 bg-transparent w-full"
            placeholder={hasStoredKey ? "Key saved (hidden)" : "Enter your key"}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
        </div>
        {!hasStoredKey ? (
          <Button
            className="flex-shrink-0 gap-4"
            variant="outline"
            disabled={!apiKeyInput}
            onClick={async () => { await encryptAndSaveAIKey(apiKeyInput); setApiKeyInput(""); setHasStoredKey(true); }}
          >
            <Save className="size-4" />
            Save
          </Button>
        ) :
          (
            <Button
              className="flex-shrink-0 gap-4"
              disabled={!hasStoredKey}
              onClick={() => { clearAIKey(); setHasStoredKey(false); }}>
              <Trash2 className="size-4 text-red-600" />
              Clear
            </Button>
          )
        }
      </div>
    </div>
  );
}


