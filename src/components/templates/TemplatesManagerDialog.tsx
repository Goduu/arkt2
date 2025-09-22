"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JSX, useEffect, useState } from "react";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { TemplatePreview } from "./TemplatePreview";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";
import { useCommandStore } from "@/app/design/commandStore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function TemplatesManagerDialog(): JSX.Element | null {
  const [isOpen, setIsTemplatesManagerOpen] = useState<boolean>(false);
  const [templates] = useTemplatesStateSynced();
  const [query, setQuery] = useState<string>("");
  const activateCommand = useCommandStore((s) => s.activateCommand);
  const { removeCommand } = useCommandStore();
  const openTemplatesManagerCommand = useCommandStore((s) => s.commandMap["open-templates-manager"]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (openTemplatesManagerCommand.status === "pending") {
      setIsTemplatesManagerOpen(true);
      removeCommand("open-templates-manager");
    }
  }, [openTemplatesManagerCommand]);

  const list = Object.values(templates)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));

  const handleClose = () => {
    setIsTemplatesManagerOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[880px] max-w-[95vw] p-0" showCloseButton>
        <DialogHeader className="px-3 py-2 pr-10 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-medium">Templates</DialogTitle>
            <Button size="sm" variant="outline" onClick={() => activateCommand("open-create-template")}>New template</Button>
          </div>
        </DialogHeader>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 w-full">
            <Input
              className="w-full rounded px-2 py-1 bg-transparent"
              placeholder="Search templates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pr-1">
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
                    <TemplatePreview
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
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleClose}>Close</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

  );
}


