"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, RefreshCw, Copy, Download, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import CodeHighlighter from "@/components/ui/CodeHighlighter";
import Link from "next/link";
import { useCommandStore } from "@/app/design/commandStore";

function toRawGithubUrl(input?: string): { raw?: string; fileName?: string } {
    if (!input) return {};
    try {
        const u = new URL(input);
        const segments = u.pathname.split("/").filter(Boolean);
        // Handle https://github.com/{owner}/{repo}/blob/{branch}/path/to/file
        const blobIdx = segments.indexOf("blob");
        if (u.hostname === "github.com" && blobIdx !== -1 && segments.length > blobIdx + 1) {
            const owner = segments[0];
            const repo = segments[1];
            const branch = segments[blobIdx + 1];
            const pathParts = segments.slice(blobIdx + 2);
            const fileName = pathParts[pathParts.length - 1];
            const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${pathParts.join("/")}`;
            return { raw, fileName };
        }
        // If it's already raw
        if (u.hostname === "raw.githubusercontent.com") {
            const fileName = segments[segments.length - 1];
            return { raw: input, fileName };
        }
    } catch { 
        console.warn("Error parsing GitHub URL");
    }
    return {};
}

export function GithubFileDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState<string>();
    const openGithubFileDialogCommand = useCommandStore((state) => state.commandMap["open-integration-dialog"]);
    const removeCommand = useCommandStore((state) => state.removeCommand);

    const { raw, fileName } = useMemo(() => toRawGithubUrl(url), [url]);
    const [content, setContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [unauthorized, setUnauthorized] = useState<boolean>(false);

    useEffect(() => {
        if (openGithubFileDialogCommand.status === "pending" && openGithubFileDialogCommand.data?.type === "github") {
            setIsOpen(true);
            setUrl(openGithubFileDialogCommand.data?.url);
            removeCommand("open-integration-dialog");
        }
    }, [openGithubFileDialogCommand])

    const load = async () => {
        if (!raw) return;
        setLoading(true);
        setError(null);
        setUnauthorized(false);
        try {
            // Use cached GET route that falls back to authenticated fetch when needed
            const res = await fetch(`/api/github/raw?url=${encodeURIComponent(url || "")}`);
            if (res.status === 401) {
                setUnauthorized(true);
            }
            if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);
            const text = await res.text();
            setContent(text);
        } catch {
            setError("Unable to fetch file");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setContent(null);
        setError(null);
        if (isOpen && raw) {
            load();
        }
    }, [isOpen, raw]);

    const handleCopy = async () => {
        if (!content) return;
        try {
            await navigator.clipboard.writeText(content);
        } catch { 
            console.warn("Error copying to clipboard");
        }
    };

    const handleDownload = () => {
        if (!content) return;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName || "file.txt";
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
            <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="truncate">{fileName || "GitHub File"}</span>
                        {url && (
                            <a className="text-primary hover:underline inline-flex items-center gap-1" href={url} target="_blank" rel="noreferrer">
                                Open on GitHub <ExternalLink className="size-3.5" />
                            </a>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {/* Controls */}
                <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground truncate">
                        {raw || "Provide a valid GitHub blob URL to preview"}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={load} disabled={!raw || loading}>
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCopy} disabled={!content}><Copy className="size-4" /></Button>
                        <Button size="sm" onClick={handleDownload} disabled={!content}><Download className="size-4" /></Button>
                    </div>
                </div>

                {/* Content */}
                <div
                    className={cn(
                        "relative rounded-md border bg-muted/20",
                        "max-h-[70vh] overflow-auto"
                    )}
                >
                    {error && !unauthorized && (
                        <div className="text-destructive text-sm p-3">{error}</div>
                    )}
                    {error && unauthorized && (
                        <div className="flex items-center gap-4 text-destructive text-sm p-3">
                            {error}
                            <Button size="sm" variant="outline">
                                <Link className="flex items-center gap-2 text-black" href="/settings">
                                    <Settings className="size-4" />
                                    Go to settings
                                </Link>
                            </Button>
                        </div>
                    )}
                    {!error && loading && (
                        <div className="flex items-center justify-center p-12 text-muted-foreground">
                            <Loader2 className="size-5 animate-spin" />
                        </div>
                    )}
                    {!error && !loading && unauthorized && (
                        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="text-sm text-muted-foreground">
                                This file may be private. Connect your GitHub account to fetch it securely.
                            </div>
                            <Button asChild size="sm">
                                <a href="/api/github/oauth/start">Connect GitHub</a>
                            </Button>
                        </div>
                    )}
                    {!error && !loading && content != null && (
                        <CodeHighlighter code={content} fileName={fileName} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default GithubFileDialog;
