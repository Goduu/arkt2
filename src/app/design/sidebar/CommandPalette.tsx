"use client";

import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { useRouter } from "next/navigation";
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
import { Type, LineSquiggle, Layers, Link as LinkIcon, Settings, Bot, Download, Upload, Plus, FileText, Blocks, Share } from "lucide-react";
import { TemplateIcon } from "@/components/templates/TemplateIcon";
import { useCommandStore } from "../commandStore";
import { useNewDraftNode } from "@/components/nodes/arkt/utils";
import useTemplatesStateSynced from "@/components/yjs/useTemplatesStateSynced";
import useNodesStateSynced from "@/components/yjs/useNodesStateSynced";

export function CommandPalette(): JSX.Element {
  const router = useRouter();
  const [nodeTemplates,] = useTemplatesStateSynced()
  const activateCommand = useCommandStore((s) => s.activateCommand);
  const { getNewDraftNode, getNewDraftTextNode } = useNewDraftNode();
  const openCommandPaletteCommand = useCommandStore((s) => s.commandMap["open-command-palette"]);
  const isDraggingNodeCommand = useCommandStore((s) => s.commandMap["dragging-node"]);
  const isFreehandModeCommand = useCommandStore((s) => s.commandMap["freehand-mode"]);
  const removeCommand = useCommandStore((s) => s.removeCommand);
  const [, setNodes] = useNodesStateSynced()

  const [open, setOpen] = useState<boolean>(false);

  const isTypingTarget = (t: EventTarget | null): boolean => {
    const el = t as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    const editable = el.isContentEditable;
    return editable || tag === "input" || tag === "textarea" || tag === "select";
  };

  useEffect(() => {
    if (openCommandPaletteCommand.status === "pending") {
      setOpen(true);
    }
  }, [openCommandPaletteCommand]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;
      const alt = e.altKey;
      const shift = e.shiftKey;
      const key = (e.key || "").toLowerCase();

      // Toggle command palette
      if (mod && key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // Do not trigger shortcuts while the palette is open
      if (open) return;

      // Only handle plain-key shortcuts (no mod/alt)
      if (mod || alt) return;

      if (key === "escape") {
        if (isDraggingNodeCommand.status === "pending") {
          removeCommand("dragging-node");
          setNodes(nodes => nodes.filter(node => "isDraft" in node.data && !node.data.isDraft));
          return;
        }
        if (isFreehandModeCommand.status === "pending") {
          removeCommand("freehand-mode");
          return;
        }
      }

      // Shift-combo shortcuts
      if (shift) {
        if (key === "c") {
          e.preventDefault();
          activateCommand("open-create-template");
          return;
        }
        if (key === "t") {
          e.preventDefault();
          activateCommand("open-templates-manager");
          return;
        }
        if (key === "s") {
          e.preventDefault();
          try { router.push("/design/settings"); } catch { /* noop */ }
          return;
        }
        if (key === "q") {
          e.preventDefault();
          activateCommand("open-collab-dialog")
          return
        }
        if (key === "e") {
          e.preventDefault();
          activateCommand("open-export-dialog")
          return
        }
        if (key === "a") {
          e.preventDefault();
          activateCommand("open-ask-ai")
          return
        }
        if (key === "i") {
          e.preventDefault();
          activateCommand("open-import-dialog")
          return
        }

      }

      // Non-shift single-key shortcuts
      if (!shift) {
        if (key === "t") {
          e.preventDefault();
          activateCommand("add-node", { nodes: [getNewDraftTextNode()] });
          return;
        }
        if (key === "l") {
          e.preventDefault();
          activateCommand("freehand-mode");
          return;
        }
        if (key === "n") {
          e.preventDefault();
          activateCommand("add-node", { nodes: [getNewDraftNode()] });
          return;
        }
        if (key === "v") {
          e.preventDefault();
          activateCommand("open-add-virtual-dialog");
          return;
        }
        if (key === "i") {
          e.preventDefault();
          activateCommand("open-add-integration-dialog");
          return;
        }
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [activateCommand, getNewDraftNode, getNewDraftTextNode, open, router]);

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
              activateCommand("add-node", { nodes: [getNewDraftTextNode()] });
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
              activateCommand("freehand-mode");
              setOpen(false);
            }}
          >
            <LineSquiggle className="mr-2 h-4 w-4" />
            <span className="flex-1">Add line</span>
            <CommandShortcut>L</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="add node"
            onSelect={() => {
              activateCommand("add-node", { nodes: [getNewDraftNode()] });
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
              activateCommand("open-add-virtual-dialog");
              setOpen(false);
            }}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">Add virtual node</span>
            <CommandShortcut>v</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="add integration"
            onSelect={() => {
              activateCommand("open-add-integration-dialog");
              setOpen(false);
            }}
          >
            <Blocks className="mr-2 h-4 w-4" />
            <span className="flex-1">Add integration</span>
            <CommandShortcut>i</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {/* <CommandItem
            value="open diagrams"
            onSelect={() => {
              // setPendingCommand({ type: "openDiagrams" });
              setOpen(false);
            }}
          >
            <Layers className="mr-2 h-4 w-4" />
            <span>Open diagrams</span>
            <CommandShortcut>⇧D</CommandShortcut>
          </CommandItem> */}
          <CommandItem
            value="open templates"
            onSelect={() => {
              activateCommand("open-templates-manager");
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
            value="collab"
            onSelect={() => {
              activateCommand("open-collab-dialog");
              setOpen(false);
            }}
          >
            <Share className="mr-2 h-4 w-4" />
            <span>Collab</span>
            <CommandShortcut>⇧Q</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="ask ai"
            onSelect={() => {
              activateCommand("open-ask-ai");
              setOpen(false);
            }}
          >
            <Bot className="mr-2 h-4 w-4" />
            <span>Ask AI</span>
            <CommandShortcut>⇧A</CommandShortcut>
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
            <CommandShortcut>⇧E</CommandShortcut>
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
            <CommandShortcut>⇧I</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Templates">
          <CommandItem
            value="create template"
            onSelect={() => {
              activateCommand("open-create-template");
              setOpen(false);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="flex-1">Create template</span>
            <CommandShortcut>⇧C</CommandShortcut>
          </CommandItem>
          {templates.map((t) => (
            <CommandItem
              key={t.id}
              value={`template ${t.name} __${t.id}`}
              onSelect={() => {
                activateCommand("add-node", { nodes: [getNewDraftNode(t)] });
                setOpen(false);
              }}
              className="[&_svg]:!size-4"
            >
              <TemplateIcon
                className="size-4 relative flex items-center justify-center shrink-0 p-0"
                iconKey={t.iconKey}
                fillColor={t.fillColor}
                strokeColor={t.strokeColor}
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


