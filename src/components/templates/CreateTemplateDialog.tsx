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
import { SketchyPanel } from "../sketchy/SketchyPanel";
import { TemplateData } from "./types";
import { nanoid } from "nanoid";
import { Color } from "../colors/types";
import { ColorSelector } from "../controls/ColorSelector";
import { IconSelector } from "@/lib/icons/IconSelector";
import { TemplateView } from "./TemplateView";

type Mode = "create" | "edit";
type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode?: Mode;
  templateId?: string;
};

export function CreateTemplateDialog({ isOpen, onClose, mode = "create", templateId }: Props): React.JSX.Element | null {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [fillColor, setFillColor] = useState<Color>(DEFAULT_FILL_COLOR);
  const [iconKey, setIconKey] = useState<IconKey | undefined>(undefined);
  const [strokeColor, setStrokeColor] = useState<Color>(DEFAULT_STROKE_COLOR);
  const [templates, setTemplates] = useTemplatesStateSynced();

  const handleDeleteTemplate = (id: string) => {
    if (!id) return;
    setTemplates((templates) => templates.filter((t) => t.id !== id));
  }
  const handleUpdateTemplate = (id: string, template: TemplateData) => {
    if (!id) return;
    setTemplates((templates) => templates.map((t) => t.id === id ? template : t));
    onClose();
  }
  const handleCreateTemplate = (template: TemplateData) => {
    setTemplates((templates) => [...templates, template]);
    onClose();
  }

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-[720px] max-w-[90vw] rounded-xs border bg-background shadow-lg">
        <SketchyPanel strokeWidth={2} strokeColor={DEFAULT_STROKE_COLOR} >
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-medium">{mode === "edit" ? "Edit template" : "Create node"}
              {mode === "edit" && (
                <div className="text-xs text-muted-foreground">
                  Editing the template will automatically update all nodes using this template.
                </div>
              )}
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>×</Button>
          </div>
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
                <Textarea rows={2} className="w-full px-2 py-1" value={description} onChange={(e) => setDescription(e.target.value)} />
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
                <TemplateView
                  name={name || "Node"}
                  fillColor={fillColor}
                  strokeColor={strokeColor}
                  iconKey={iconKey}
                />
              </div>
              <div className="flex justify-between gap-2">
                {mode === "edit" ? (
                  <div>
                    <Button
                      variant="destructive"
                      className="z-10"
                      onClick={() => {
                        if (!templateId) return;

                        const ok = window.confirm("Delete this template? This cannot be undone.");
                        if (!ok) return;
                        handleDeleteTemplate(templateId);
                        onClose();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ) : <div />}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
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
                      onClose();
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
              </div>
            </div>
          </div>
        </SketchyPanel>
      </div>
    </div>
  );
}


