"use client";

import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageMetadata, ToolEvent } from "@/lib/ai/aiTypes";
import { useState } from "react";

type DetailsBarProps = {
  usage: MessageMetadata["usage"] | null;
  modelUsed: string | null;
  toolEvents: ToolEvent[];
  startedAt: number | null;
  endedAt: number | null;
};

export function DetailsBar({ usage, modelUsed, toolEvents, startedAt, endedAt }: DetailsBarProps): React.JSX.Element {
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  return (
    <div className="mb-2">
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1">
              <span className="opacity-70">Tokens</span>
              <span className="font-medium">{usage?.totalTokens ?? '–'}</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1">
              <span className="opacity-70">Tools</span>
              <span className="font-medium">{toolEvents.length}</span>
            </div>
            {modelUsed && (
              <div className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1">
                <span className="opacity-70">Model</span>
                <span className="font-medium">{modelUsed}</span>
              </div>
            )}
            {startedAt && endedAt && (
              <div className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1">
                <span className="opacity-70">Time</span>
                <span className="font-medium">{Math.max(0, endedAt - startedAt)}ms</span>
              </div>
            )}
          </div>
          <CollapsibleTrigger className="text-[11px] underline underline-offset-2 hover:text-foreground">
            {detailsOpen ? 'Hide details' : 'Show details'}
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-4">
            <SketchyPanel className="rounded bg-card p-2">
              <div className="opacity-70">Prompt tokens</div>
              <div className="font-medium">{usage?.inputTokens ?? '–'}</div>
            </SketchyPanel>
            <SketchyPanel className="rounded bg-card p-2">
              <div className="opacity-70">Completion tokens</div>
              <div className="font-medium">{usage?.outputTokens ?? '–'}</div>
            </SketchyPanel>
            <SketchyPanel className="rounded bg-card p-2">
              <div className="opacity-70">Total tokens</div>
              <div className="font-medium">{usage?.totalTokens ?? '–'}</div>
            </SketchyPanel>
            <SketchyPanel className="rounded bg-card p-2">
              <div className="opacity-70">Model</div>
              <div className="font-medium truncate" title={modelUsed || undefined}>
                {modelUsed ?? '–'}
              </div>
            </SketchyPanel>
          </div>
          {toolEvents.length > 0 && (
            <SketchyPanel className="mt-2 rounded bg-card p-2 text-xs">
              <div className="mb-1 font-medium">Tool calls</div>
              <div className="space-y-1 max-h-40 overflow-auto pr-1">
                {toolEvents.map((t, idx) => (
                  <SketchyPanel key={idx} className="rounded bg-muted/40 p-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{t.name}</div>
                      <div className="opacity-70">{new Date(t.atMs).toLocaleTimeString()}</div>
                    </div>
                    {t.error ? (
                      <div className="text-red-600">{t.error}</div>
                    ) : (
                      <div className="opacity-80 truncate">
                        {typeof t.result === 'string' ? t.result.slice(0, 200) :
                          t.result ? JSON.stringify(t.result).slice(0, 200) : 'called'}
                      </div>
                    )}
                  </SketchyPanel>
                ))}
              </div>
            </SketchyPanel>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}


