"use client";

import { Button } from "@/components/ui/button";
import { IconKey } from "@/lib/icons/iconRegistry";
import { useMemo } from "react";
import { DEFAULT_FILL_COLOR } from "../colors/utils";
import { TemplateData } from "./types";
import { nanoid } from "nanoid";
import { Color } from "../colors/types";

type CreateTemplateFooterProps = {
  templateId: string | undefined;
  mode: "create" | "edit";
  onClose: () => void;
  name: string;
  description: string;
  fillColor: Color;
  iconKey: IconKey | undefined;
  strokeColor: Color;
  templates: TemplateData[];
  setTemplates: (templates: TemplateData[]) => void;
}

export function CreateTemplateFooter(props: CreateTemplateFooterProps): React.JSX.Element | null {

  const {
    onClose,
    templateId,
    mode,
    name,
    description,
    fillColor,
    iconKey,
    strokeColor,
    templates,
    setTemplates,
     } = props;

  const handleDeleteTemplate = (id: string) => {
    if (!id) return;
    const newTemplates = templates.filter((t) => t.id !== id);
    setTemplates(newTemplates);
  }

  const handleClose = () => {
    onClose();
  }

  const handleUpdateTemplate = (id: string, template: TemplateData) => {
    if (!id) return;
    const newTemplates = templates.map((t) => t.id === id ? template : t);
    setTemplates(newTemplates);
    handleClose();
  }

  const handleCreateTemplate = (template: TemplateData) => {
    const newTemplates = [...templates, template];
    setTemplates(newTemplates);
    handleClose();
  }

  

  const normalizedName = (name ?? "").trim();
  const isDuplicateName = useMemo(() => {
    const target = normalizedName.toLowerCase();
    if (!target) return false;
    return Object.values(templates).some((t) => t.name.trim().toLowerCase() === target && t.id !== templateId);
  }, [templates, normalizedName, templateId]);

  return (
    <div className="md:p-4">
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
        <Button
          data-testid="template-dialog-cancel"
          variant="ghost"
          size="sm"
          onClick={handleClose}
        >
          Cancel
        </Button>
        {mode === "edit" ? (
          <Button
            data-testid="template-dialog-save"
            size="sm" disabled={isDuplicateName || !normalizedName}
            onClick={() => {
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
            }}
          >
            Save
          </Button>
        ) : (
          <Button
            data-testid="template-dialog-create"
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

  );
}


