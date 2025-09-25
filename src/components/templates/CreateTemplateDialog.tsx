"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconKey } from "@/lib/icons/iconRegistry";
import { useState } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR, TAILWIND_FILL_COLORS } from "../colors/utils";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";
import { TemplateData } from "./types";
import { nanoid } from "nanoid";
import { Color } from "../colors/types";
import { ColorSelector } from "../controls/ColorSelector";
import { IconSelector } from "@/lib/icons/IconSelector";
import { TemplatePreview } from "./TemplatePreview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useCommandStore } from "@/app/design/commandStore";


export function CreateTemplateDialog(): React.JSX.Element | null {
  const [name, setName] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [fillColor, setFillColor] = useState<Color>(DEFAULT_FILL_COLOR);
  const [iconKey, setIconKey] = useState<IconKey | undefined>(undefined);
  const [strokeColor, setStrokeColor] = useState<Color>(DEFAULT_STROKE_COLOR);
  const [templates, setTemplates] = useTemplatesStateSynced();
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const createTemplateDialogCommand = useCommandStore((s) => s.commandMap["open-create-template"]);
  const removeCommand = useCommandStore((s) => s.removeCommand);

  const handleDeleteTemplate = (id: string) => {
    if (!id) return;
    setTemplates((templates) => templates.filter((t) => t.id !== id));
  }

  const handleClose = () => {
    setIsOpen(false);
  }

  const handleUpdateTemplate = (id: string, template: TemplateData) => {
    if (!id) return;
    setTemplates((templates) => templates.map((t) => t.id === id ? template : t));
    handleClose();
  }
  const handleCreateTemplate = (template: TemplateData) => {
    setTemplates((templates) => [...templates, template]);
    handleClose();
  }

  useEffect(() => {
    if (createTemplateDialogCommand.status === "pending") {
      setIsOpen(true);
      removeCommand("open-create-template");
      setTemplateId(createTemplateDialogCommand.data?.templateId);
      setMode(createTemplateDialogCommand.data?.templateId ? "edit" : "create");
    }
  }, [createTemplateDialogCommand]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && templateId) {
      const existing = templates.find((t) => t.id === templateId);
      if (existing) {
        setName(existing.name);
        setDescription(existing.description ?? "");
        setFillColor(existing.fillColor ?? DEFAULT_FILL_COLOR);
        setIconKey(existing.iconKey);
        setStrokeColor(existing.strokeColor ?? DEFAULT_STROKE_COLOR);
      }
    }
    if (mode === "create") {
      setName("");
      setDescription("");
      setFillColor(DEFAULT_FILL_COLOR);
      setIconKey(undefined);
      setStrokeColor(DEFAULT_STROKE_COLOR);
    }
  }, [isOpen, mode, templateId, templates]);

  const normalizedName = (name ?? "").trim();
  const isDuplicateName = useMemo(() => {
    const target = normalizedName.toLowerCase();
    if (!target) return false;
    return Object.values(templates).some((t) => t.name.trim().toLowerCase() === target && t.id !== templateId);
  }, [templates, normalizedName, templateId]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-auto max-w-[90vw] p-0" showCloseButton={false}>
        <DialogHeader className="px-3 py-2 border-b">
          <DialogTitle className="text-sm font-medium">
            {mode === "edit" ? "Edit template" : "Create node"}
            {mode === "edit" && (
              <div className="text-xs text-muted-foreground font-normal">
                Editing the template will automatically update all nodes using this template.
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4 text-sm">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Name</label>
              <Input className="w-full px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} />
              {isDuplicateName && (
                <div className="text-xs text-destructive mt-1">A template with this name already exists.</div>
              )}
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Description</label>
              <Textarea rows={2} className="w-full px-2 py-1" value={description} onChange={(e) => "target" in e && setDescription(e.target.value)} />
              {isDuplicateName && (
                <div className="text-xs text-destructive mt-1">A template with this name already exists.</div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <ColorSelector label="Fill color" value={fillColor} onChange={setFillColor} indicative="low" defaultOptions={TAILWIND_FILL_COLORS} />
              <ColorSelector label="Stroke color" value={strokeColor} onChange={setStrokeColor} indicative="high" />
            </div>
            <IconSelector label="Icon" value={iconKey} onChange={setIconKey} />
          </div>
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">Preview</div>
            <div className="flex items-center justify-center p-6">
              <TemplatePreview
                name={name || "Node"}
                fillColor={fillColor}
                strokeColor={strokeColor}
                iconKey={iconKey}
              />
            </div>
            <DialogFooter className="flex justify-between gap-2">
              {mode === "edit" ? (
                <Button
                  variant="destructive"
                  className="z-10"
                  onClick={() => {
                    if (!templateId) return;

                    const ok = window.confirm("Delete this template? This cannot be undone.");
                    if (!ok) return;
                    handleDeleteTemplate(templateId);
                    handleClose();
                  }}
                >
                  Delete
                </Button>
              ) : <div />}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
                {mode === "edit" ? (
                  <Button size="sm" disabled={isDuplicateName || !normalizedName} onClick={() => {
                    if (!templateId) return;
                    if (isDuplicateName) return;
                    handleUpdateTemplate(templateId, {
                      id: templateId,
                      name: normalizedName || "Node",
                      description: description,
                      fillColor,
                      strokeColor,
                      iconKey,
                      updatedAt: Date.now(),
                    });
                    handleClose();
                  }}>Save</Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDuplicateName || !normalizedName}
                    fillColor={DEFAULT_FILL_COLOR}
                    onClick={() => {
                      if (isDuplicateName) return;
                      handleCreateTemplate({
                        id: nanoid(),
                        name: normalizedName || "Node",
                        description: description,
                        fillColor,
                        strokeColor,
                        iconKey,
                        updatedAt: Date.now(),
                      });
                    }}>
                    Create</Button>
                )}
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


