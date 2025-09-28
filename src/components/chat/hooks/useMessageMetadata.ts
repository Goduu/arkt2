"use client";

import { useCallback, useEffect, useState } from "react";
import type { ArktUIMessage, MessageMetadata, ToolEvent } from "@/lib/ai/aiTypes";

export function useMessageMetadata(messages?: Array<ArktUIMessage>) {
  const [usage, setUsage] = useState<MessageMetadata["usage"] | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    if (!lastAssistant) return;
    const metadata = lastAssistant.metadata;
    if (!metadata) return;

    if (metadata.model && metadata.model !== modelUsed) {
      setModelUsed(metadata.model);
    }

    const hasAnyToken = typeof metadata.usage?.totalTokens === 'number';
    if (hasAnyToken) {
      setUsage(metadata.usage);
    }

    if (typeof metadata.createdAt === 'number' && (!startedAt || startedAt !== metadata.createdAt)) {
      setStartedAt(metadata.createdAt);
    }

    if (typeof metadata.usage?.totalTokens === 'number' && !endedAt) {
      setEndedAt(Date.now());
    }

    if (Array.isArray(metadata.tools) && metadata.tools.length > 0) {
      setToolEvents((prev) => {
        const next = [...prev];
        for (const t of metadata.tools!) {
          next.push({
            name: t.name,
            args: t.input,
            result: t.output,
            error: t.error ? String(t.error) : undefined,
            atMs: t.atMs,
          });
        }
        const seen = new Set<string>();
        return next.filter((e) => {
          const key = `${e.atMs}|${e.name}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
    }
  }, [messages, modelUsed, startedAt, endedAt]);

  const resetMetadata = useCallback((initialStartAt?: number) => {
    setUsage(null);
    setModelUsed(null);
    setToolEvents([]);
    setStartedAt(typeof initialStartAt === 'number' ? initialStartAt : null);
    setEndedAt(null);
  }, []);

  return { usage, modelUsed, toolEvents, startedAt, endedAt, setStartedAt, setEndedAt, resetMetadata } as const;
}


