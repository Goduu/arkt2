"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { useCommandStore } from "../commandStore";
import { decryptImportedBlob, importFromEnvelopeText, parseImportText, type ExportPayload } from "./exportImport";
import type { EncryptedBlob } from "@/lib/server/crypto";

export function ImportDialog() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [encryptDetected, setEncryptDetected] = useState<boolean>(false);
  const [encryptedBlob, setEncryptedBlob] = useState<EncryptedBlob | null>(null);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const removeCommand = useCommandStore((state) => state.removeCommand);
  const openImportDialogCommand = useCommandStore((state) => state.commandMap["open-import-dialog"]);

  useEffect(() => {
    if (openImportDialogCommand.status === "pending") {
      setIsOpen(true);
      removeCommand("open-import-dialog");
      // Immediately open file picker
      try { fileInputRef.current?.click(); } catch { /* noop */ }
    }
  }, [openImportDialogCommand]);

  const readFileText = (f: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(f);
  });

  const reset = () => {
    setEncryptDetected(false);
    setEncryptedBlob(null);
    setPassword("");
    try { if (fileInputRef.current) fileInputRef.current.value = ""; } catch { /* noop */ }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    try {
      const text = await readFileText(f);
      const parsed = parseImportText(text);
      if (parsed.encrypted) {
        setEncryptDetected(true);
        setEncryptedBlob(parsed.blob);
        setError("");
      } else {
        // Apply immediately
        await importFromEnvelopeText(text, { applyMode: "merge" });
        reset();
        setIsOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    }
  };

  const onSubmitDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encryptedBlob) {
      setError("No encrypted file loaded");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload: ExportPayload = await decryptImportedBlob(encryptedBlob, password);
      // Apply snapshot
      await importFromEnvelopeText(JSON.stringify({ v: 1, kind: "arkt-export", encrypted: false, data: payload }), { applyMode: "merge" });
      reset();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decrypt file");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); reset(); } }}>
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Import snapshot</DialogTitle>
          <DialogDescription>
            Choose a previously exported file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileChange} className="hidden" />
          {!encryptDetected && (
            <Button type="button" onClick={() => fileInputRef.current?.click()}>Select file…</Button>
          )}
          {encryptDetected && (
            <form onSubmit={onSubmitDecrypt} className="grid gap-3">
              <Label htmlFor="import-password">Enter password to decrypt</Label>
              <Input id="import-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground">If the password is incorrect, decryption will fail.</p>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" type="button" disabled={submitting} onClick={() => { setIsOpen(false); reset(); }}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={submitting || password.length === 0}>{submitting ? "Decrypting…" : "Import"}</Button>
              </div>
            </form>
          )}
          {error && (<p className="text-sm text-red-500">{error}</p>)}
        </div>
        {!encryptDetected && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" onClick={() => { setIsOpen(false); reset(); }}>Close</Button>
            </DialogClose>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ImportDialog;


