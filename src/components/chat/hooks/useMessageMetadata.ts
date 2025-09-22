"use client";

import { useCallback, useEffect, useState } from "react";
import type { MessageMetadata, MyUIMessage, ToolEvent } from "@/lib/aiTypes";


export function useMessageMetadata(messages: Array<MyUIMessage> | undefined) {
  const [usage, setUsage] = useState<MessageMetadata["usage"] | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant') as MyUIMessage | undefined;
    if (!lastAssistant) return;
    const md = lastAssistant.metadata;
    if (!md) return;

    if (md.model && md.model !== modelUsed) {
      setModelUsed(md.model);
    }

    const hasAnyToken = typeof md.usage?.totalTokens === 'number';
    if (hasAnyToken) {
      setUsage(md.usage);
    }

    if (typeof md.createdAt === 'number' && (!startedAt || startedAt !== md.createdAt)) {
      setStartedAt(md.createdAt);
    }

    if (typeof md.usage?.totalTokens === 'number' && !endedAt) {
      setEndedAt(Date.now());
    }

    if (Array.isArray(md.tools) && md.tools.length > 0) {
      setToolEvents((prev) => {
        const next = [...prev];
        for (const t of md.tools!) {
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


