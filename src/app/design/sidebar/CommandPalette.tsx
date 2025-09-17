"use client";

import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { useRouter } from "next/navigation";
// import { useAppStore } from "@/lib/store";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Type, LineSquiggle, Layers, Link as LinkIcon, Settings, Bot, Download, Upload, Plus, FileText } from "lucide-react";
import { TemplateIcon } from "@/components/templates/TemplateIcon";

export function CommandPalette(): JSX.Element {
  const router = useRouter();
  const nodeTemplates = () => {}
  // const setPendingCommand = useAppStore((s) => s.setPendingCommand);
  // const setPendingSpawn = useAppStore((s) => s.setPendingSpawn);
  // const nodeTemplates = useAppStore((s) => s.nodeTemplates);

  const [open, setOpen] = useState<boolean>(false);

  const isTypingTarget = (t: EventTarget | null): boolean => {
    const el = t as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    const editable = el.isContentEditable;
    return editable || tag === "input" || tag === "textarea" || tag === "select";
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const templates = useMemo(() => {
    return Object.values(nodeTemplates).sort((a, b) => (b.lastUsedAt ?? b.updatedAt) - (a.lastUsedAt ?? a.updatedAt));
  }, [nodeTemplates]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="scrollbar-hide">
      <CommandInput placeholder="Type a command or search templates..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            value="add text"
            onSelect={() => {
              // setPendingCommand({ type: "addText" });
              setOpen(false);
            }}
          >
            <Type className="mr-2 h-4 w-4" />
            <span className="flex-1">Add text</span>
            <CommandShortcut>t</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="add line"
            onSelect={() => {
              // setPendingCommand({ type: "addLine" });
              setOpen(false);
            }}
          >
            <LineSquiggle className="mr-2 h-4 w-4" />
            <span className="flex-1">Add line</span>
            <CommandShortcut>l</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="add node"
            onSelect={() => {
              // setPendingCommand({ type: "addNode" });
              setOpen(false);
            }}
          >
            <Layers className="mr-2 h-4 w-4" />
            <span className="flex-1">Add node</span>
            <CommandShortcut>n</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="add virtual node"
            onSelect={() => {
              // setPendingCommand({ type: "addVirtual" });
              setOpen(false);
            }}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">Add virtual node</span>
            <CommandShortcut>v</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="create template"
            onSelect={() => {
              // setPendingCommand({ type: "openCreateTemplate" });
              setOpen(false);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="flex-1">Create template</span>
            <CommandShortcut>⇧C</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem
            value="open diagrams"
            onSelect={() => {
              // setPendingCommand({ type: "openDiagrams" });
              setOpen(false);
            }}
          >
            <Layers className="mr-2 h-4 w-4" />
            <span>Open diagrams</span>
            <CommandShortcut>⇧D</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="open templates"
            onSelect={() => {
              // setPendingCommand({ type: "openTemplates" });
              setOpen(false);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Open templates</span>
            <CommandShortcut>⇧T</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="open settings"
            onSelect={() => {
              router.push("/settings");
              setOpen(false);
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Open settings</span>
            <CommandShortcut>⇧S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Utilities">
          <CommandItem
            value="ask ai"
            onSelect={() => {
              try { window.dispatchEvent(new Event("arkt:open-ask-ai")); } catch { console.warn("Error dispatching event"); }
              setOpen(false);
            }}
          >
            <Bot className="mr-2 h-4 w-4" />
            <span>Ask AI</span>
          </CommandItem>
          <CommandItem
            value="export"
            onSelect={() => {
              // setPendingCommand({ type: "export" });
              setOpen(false);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            <span>Export</span>
          </CommandItem>
          <CommandItem
            value="import"
            onSelect={() => {
              try { window.dispatchEvent(new Event("arkt:trigger-import")); } catch { console.warn("Error dispatching event"); }
              setOpen(false);
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            <span>Import</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Templates">
          {templates.map((t) => (
            <CommandItem
              key={t.id}
              value={`template ${t.name} __${t.id}`}
              onSelect={() => {
                // setPendingSpawn({ templateId: t.id });
                setOpen(false);
              }}
            >
                <TemplateIcon
                  className="size-5 relative flex items-center justify-center shrink-0"
                  iconKey={t.data.iconKey}
                  fillColor={t.data.fillColor}
                  strokeColor={t.data.strokeColor}
                />
                {t.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;


