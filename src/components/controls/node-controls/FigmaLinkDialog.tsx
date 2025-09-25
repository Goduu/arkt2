"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Figma, Loader2, RefreshCw, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCommandStore } from "@/app/design/commandStore";

type FigmaOEmbed = {
  title?: string;
  author_name?: string;
  provider_name?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  html?: string;
};

function isValidFigmaUrl(input?: string): boolean {
  if (!input) return false;
  try {
    const u = new URL(input);
    if (u.protocol !== "https:") return false;
    if (!u.hostname.endsWith("figma.com")) return false;
    // Common valid path prefixes
    const first = u.pathname.split("/").filter(Boolean)[0] ?? "";
    return ["file", "design", "proto", "community", "embed"].includes(first);
  } catch {
    return false;
  }
}

function toFigmaEmbedUrl(input?: string): string | undefined {
  if (!isValidFigmaUrl(input)) return undefined;
  // Construct iframe embed URL
  // We set a custom embed_host so Figma can attribute embeds
  return `https://www.figma.com/embed?embed_host=arkt&url=${encodeURIComponent(input ?? "")}`;
}

export function FigmaLinkDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState<string>();
  const [oembed, setOembed] = useState<FigmaOEmbed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const integrationCommand = useCommandStore((state) => state.commandMap["open-integration-dialog"]);
  const removeCommand = useCommandStore((state) => state.removeCommand);

  const isValid = useMemo(() => isValidFigmaUrl(url), [url]);
  const embedUrl = useMemo(() => toFigmaEmbedUrl(url), [url]);

  useEffect(() => {
    if (integrationCommand.status === "pending" && integrationCommand.data?.type === "figma") {
      setIsOpen(true);
      setUrl(integrationCommand.data?.url);
      removeCommand("open-integration-dialog");
    }
  }, [integrationCommand]);

  const load = async () => {
    if (!url || !isValid) return;
    setLoading(true);
    setError(null);
    setOembed(null);
    try {
      // Fetch oEmbed via cached Next.js API route
      const res = await fetch(`/api/figma/oembed?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data: FigmaOEmbed = await res.json();
        setOembed(data);
      } else {
        setOembed(null);
      }
    } catch {
      setOembed(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOembed(null);
    setError(null);
    if (isOpen && isValid) {
      load();
    }
  }, [isOpen, isValid, url]);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // noop
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Figma className="size-4" />
            <span className="truncate">{oembed?.title || "Figma Preview"}</span>
            {url && (
              <a className="text-primary hover:underline inline-flex items-center gap-1" href={url} target="_blank" rel="noreferrer">
                Open in Figma <ExternalLink className="size-3.5" />
              </a>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground truncate">
            {isValid ? url : "Provide a valid Figma link (file/design/proto/community)"}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)} disabled={!embedUrl || loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopy} disabled={!url}><Copy className="size-4" /></Button>
            {oembed?.author_name && (
              <div className="hidden sm:block text-xs text-muted-foreground px-2">
                {oembed.author_name}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          className={cn(
            "relative rounded-md border bg-muted/20",
            "max-h-[70vh] overflow-auto"
          )}
        >
          {!isValid && (
            <div className="text-destructive text-sm p-3">Invalid Figma URL</div>
          )}
          {isValid && loading && (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          {isValid && !loading && embedUrl && (
            <div className="w-full p-2">
              {/* Maintain a 16:9-ish responsive frame */}
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  key={reloadKey}
                  className="absolute inset-0 w-full h-full rounded-md border"
                  src={`${embedUrl}`}
                  allowFullScreen
                />
              </div>
              {oembed?.thumbnail_url && (
                <div className="sr-only">
                  <img src={oembed.thumbnail_url} alt={oembed.title || "Figma thumbnail"} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Helper: link to settings if we ever add Figma auth in future */}
        {error && (
          <div className="flex items-center gap-4 text-destructive text-sm p-3">
            {error}
            <Button size="sm" variant="outline">
              <Link className="flex items-center gap-2 text-black" href="/settings">
                Go to settings
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FigmaLinkDialog;


