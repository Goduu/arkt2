"use client";

import { useState } from "react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useCommandStore } from "@/app/design/commandStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { CreateTemplateContent } from "./CreateTemplateContent";
import { CreateTemplateFooter } from "./CreateTemplateFooter";
import { Color } from "../colors/types";
import { IconKey } from "@/lib/icons/iconRegistry";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from "../colors/utils";

export function CreateTemplateDialog(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [fillColor, setFillColor] = useState<Color>(DEFAULT_FILL_COLOR);
  const [iconKey, setIconKey] = useState<IconKey | undefined>(undefined);
  const [strokeColor, setStrokeColor] = useState<Color>(DEFAULT_STROKE_COLOR);
  const [templates, setTemplates] = useTemplatesStateSynced();
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const createTemplateDialogCommand = useCommandStore((s) => s.commandMap["open-create-template"]);
  const removeCommand = useCommandStore((s) => s.removeCommand);
  const isMobile = useIsMobile();

  const handleClose = () => {
    setIsOpen(false);
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

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(next) => setIsOpen(next)}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Edit profile</DrawerTitle>
            <CreateTemplateContent
              name={name}
              description={description}
              fillColor={fillColor}
              iconKey={iconKey}
              strokeColor={strokeColor}
              templates={templates}
              templateId={templateId}
              setName={setName}
              setDescription={setDescription}
              setFillColor={setFillColor}
              setIconKey={setIconKey}
              setStrokeColor={setStrokeColor}
            />
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <CreateTemplateFooter
              onClose={handleClose}
              templateId={templateId}
              mode={mode}
              name={name}
              description={description}
              fillColor={fillColor}
              iconKey={iconKey}
              strokeColor={strokeColor}
              templates={templates}
              setTemplates={setTemplates}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className=" p-0" showCloseButton={false} data-testid="create-template-dialog">
        <DialogDescription hidden>Create template</DialogDescription>
        <DialogHeader className="px-3 py-2 border-b">
          <DialogTitle className="text-sm font-medium">
            {mode === "edit" ? "Edit template" : "Create template"}
            {mode === "edit" && (
              <div className="text-xs text-muted-foreground font-normal">
                Editing the template will automatically update all nodes using this template.
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        <CreateTemplateContent
          name={name}
          description={description}
          fillColor={fillColor}
          iconKey={iconKey}
          strokeColor={strokeColor}
          templates={templates}
          templateId={templateId}
          setName={setName}
          setDescription={setDescription}
          setFillColor={setFillColor}
          setIconKey={setIconKey}
          setStrokeColor={setStrokeColor}
        />
        <DialogFooter className="flex justify-between gap-2">
          <CreateTemplateFooter
            onClose={handleClose}
            templateId={templateId}
            mode={mode}
            name={name}
            description={description}
            fillColor={fillColor}
            iconKey={iconKey}
            strokeColor={strokeColor}
            templates={templates}
            setTemplates={setTemplates}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}


