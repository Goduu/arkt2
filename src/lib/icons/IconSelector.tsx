"use client";

import * as React from "react";
import { ICONS, IconKey, getIconByKey } from "@/lib/icons/iconRegistry";
import { useState, useMemo } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";

type Props = {
  label?: string;
  value?: IconKey;
  onChange: (key: IconKey | undefined) => void;
};

export function IconSelector({ label = "Icon", value, onChange }: Props): React.JSX.Element {
  const selected = getIconByKey(value);
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const quickIcons = useMemo(() => {
    const recent = ICONS.slice(0, 5);
    const needed = 5 - recent.length;
    if (needed <= 0) return recent;
    const fillers = [] as typeof recent;
    for (const def of ICONS) {
      if (!recent.some((r) => r.key === def.key)) {
        fillers.push(def);
        if (fillers.length >= needed) break;
      }
    }
    return [...recent, ...fillers];
  }, [ICONS]);

  function handleSelect(key: IconKey | undefined) {
    onChange(key);
  }

  return (
    <Field data-testid="icon-selector">
      <FieldLabel htmlFor="icon-selector">{label}</FieldLabel>
      <FieldContent>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className={`h-8 z-10 px-2 text-xs size-9`}
          onClick={() => handleSelect(undefined)}
          fillColor={{ family: !value ? "lime" : "white", indicative: "low" }}
          title="No icon"
        >
          
        </Button>
        {quickIcons.map((def) => {
          const I = def.Icon;
          const isActive = def.key === selected?.key;
          return (
            <Button
              key={def.key}
              size="icon"
              data-testid={`icon-selector-key-${def.key}`}
              className="z-10 text-xs inline-flex items-center gap-1 hover:bg-muted"
              onClick={() => handleSelect(def.key)}
              title={def.label}
              aria-label={def.label}
              fillColor={{ family: isActive ? "lime" : "base", indicative: "low" }}
              fillStyle="dots"
            >
              <I className="h-4 w-4" />
            </Button>
          );
        })}
        <Button
          type="button"
          className={`h-8 z-10 px-2 text-xs`}
          onClick={() => setDialogOpen(true)}
          title="Browse more icons"
        >
          More
        </Button>
      </div>
      </FieldContent>

      <CommandDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Select an icon"
        description="Search all icons"
        showCloseButton
        className="w-[min(100vw-2rem,1100px)]"
      >
        <CommandInput placeholder="Search icons by label..." />
        <CommandList className="h-72 overflow-y-scroll">
          <CommandEmpty>No icons found.</CommandEmpty>
          <CommandGroup heading="All Icons" className="pt-2">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-2">
              {ICONS.map((def) => {
                const I = def.Icon;
                return (
                  <CommandItem
                    key={def.key}
                    value={`${def.label} ${def.key}`}
                    onSelect={() => {
                      handleSelect(def.key);
                      setDialogOpen(false);
                    }}
                    className="size-8 flex flex-col items-center justify-center gap-2"
                  >
                    <I className="h-6 w-6" />
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </CommandList>
        <DialogFooter>
          <Button type="button" className={`h-8 z-10 px-2 text-xs`} onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </CommandDialog>
    </Field>
  );
}


