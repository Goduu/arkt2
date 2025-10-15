"use client";

import { Input } from "@/components/ui/input";
import { IconKey } from "@/lib/icons/iconRegistry";
import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { TAILWIND_FILL_COLORS } from "../colors/utils";
import { Color } from "../colors/types";
import { ColorSelector } from "../controls/ColorSelector";
import { IconSelector } from "@/lib/icons/IconSelector";
import { TemplateData } from "./types";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field";

type CreateTemplateContentProps = {
  name: string;
  description: string;
  fillColor: Color;
  iconKey: IconKey | undefined;
  strokeColor: Color;
  templates: TemplateData[];
  templateId: string | undefined;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setFillColor: (fillColor: Color) => void;
  setIconKey: (iconKey: IconKey | undefined) => void;
  setStrokeColor: (strokeColor: Color) => void;
}
export function CreateTemplateContent(props: CreateTemplateContentProps): React.JSX.Element | null {
  const {
    name,
    description,
    fillColor,
    iconKey,
    strokeColor,
    templates,
    templateId,
    setName,
    setDescription,
    setFillColor,
    setIconKey,
    setStrokeColor } = props;

  const normalizedName = (name ?? "").trim();
  const isDuplicateName = useMemo(() => {
    const target = normalizedName.toLowerCase();
    if (!target) return false;
    return Object.values(templates).some((t) => t.name.trim().toLowerCase() === target && t.id !== templateId);
  }, [templates, normalizedName, templateId]);

  return (
    <FieldSet className="flex flex-col gap-2 md:p-4">
      <FieldGroup className="flex px-1 gap-0 md:gap-4 ">
          <Field>
            <FieldLabel htmlFor="create-template-dialog-name">Name</FieldLabel>
            <Input
              id="create-template-dialog-name"
              data-testid="create-template-dialog-name"
              className="w-full px-2 py-1" value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FieldError>
              {isDuplicateName && (
                <div className="text-xs text-destructive mt-1">A template with this name already exists.</div>
              )}
            </FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="create-template-dialog-description">Description</FieldLabel>
            <FieldDescription>This description will give more context about this template to the AI.</FieldDescription>
            <Textarea
              id="create-template-dialog-description"
              data-testid="create-template-dialog-description"
              rows={2}
              className="w-full px-2 py-1" value={description}
              onChange={(e) => "target" in e && setDescription(e.target.value)}
            />
            <FieldError>
              {isDuplicateName && (
                <div className="text-xs text-destructive mt-1">A template with this name already exists.</div>
              )}
            </FieldError>
          </Field>
        <ColorSelector
          data-testid="create-template-dialog-fill-color"
          label="Fill color"
          value={fillColor}
          onChange={setFillColor}
          indicative="low"
          defaultOptions={TAILWIND_FILL_COLORS}
        />
        <ColorSelector
          data-testid="create-template-dialog-stroke-color"
          label="Stroke color"
          value={strokeColor}
          onChange={setStrokeColor}
          indicative="high"
        />
      <IconSelector data-testid="create-template-dialog-icon-key" label="Icon" value={iconKey} onChange={setIconKey} />
      </FieldGroup>
    </FieldSet>
  );
}


