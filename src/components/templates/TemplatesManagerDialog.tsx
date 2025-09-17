"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JSX, useEffect, useState } from "react";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { TemplateView } from "./TemplateView";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";
import { useAppStore } from "@/app/design/store";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function TemplatesManagerDialog({ isOpen, onClose }: Props): JSX.Element | null {
  const [templates] = useTemplatesStateSynced();
  const [query, setQuery] = useState<string>("");
  const activateCommand = useAppStore((s) => s.activateCommand);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const list = Object.values(templates)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-[880px] max-w-[95vw] rounded-xs border bg-background">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="text-sm font-medium">Templates</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => activateCommand("open-create-template")}>New template</Button>
            <Button size="icon" variant="ghost" onClick={onClose}>×</Button>
          </div>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 w-full">
            <Input
              className="w-full rounded px-2 py-1 bg-transparent"
              placeholder="Search templates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-auto pr-1">
            {list.map((tpl) => (
              <SketchyPanel key={tpl.id} className="w-full h-full" hoverEffect>
                <button
                  key={tpl.id}
                  className="group bg-transparent rounded-md transition text-left w-full"
                  onClick={() => activateCommand("open-create-template", { templateId: tpl.id })}
                  title={tpl.name}
                >
                  <div className="p-3">
                    <div className="text-xs font-medium truncate">{tpl.name}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(tpl.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    <TemplateView
                      name={tpl.name}
                      fillColor={tpl.fillColor}
                      strokeColor={tpl.strokeColor}
                      iconKey={tpl.iconKey}
                    />
                  </div>
                </button>
              </SketchyPanel>
            ))}
            {list.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-12">No templates found.</div>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>

  );
}


