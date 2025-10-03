import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { TemplateIcon } from "./TemplateIcon";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";

type TemplateComboboxProps = {
    templateId?: string;
    commit: (templateId?: string) => void;
};

export function TemplateCombobox({
    templateId,
    commit,
}: TemplateComboboxProps) {
    const [tplOpen, setTplOpen] = useState<boolean>(false);
    const [tplQuery, setTplQuery] = useState<string>("");
    const [templates,] = useTemplatesStateSynced();
    const filtered = useMemo(() => {
        const q = tplQuery.trim().toLowerCase();
        if (!q) return templates;
        return templates.filter((t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }, [templates, tplQuery]);
    const currentTemplate = useMemo(() => {
        return templateId ? templates.find((t) => t.id === templateId) ?? undefined : undefined;
    }, [templateId, templates]);

    return (
        <div>
            <label className="block text-xs text-muted-foreground mb-1">Template</label>
            <Popover open={tplOpen} onOpenChange={setTplOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={tplOpen}
                        className="w-full justify-between"
                    >
                        <div className="relative flex items-center gap-2">
                            {currentTemplate?.iconKey && (
                                <TemplateIcon
                                    className="size-6"
                                    iconKey={currentTemplate.iconKey}
                                    strokeColor={currentTemplate.strokeColor}
                                    fillColor={currentTemplate.fillColor}
                                />
                            )}
                            {currentTemplate?.name ?? "Set template"}
                        </div>
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search template..."
                            value={tplQuery}
                            onValueChange={setTplQuery}
                            className="h-9"
                        />
                        <CommandList>
                            {templateId &&
                                <CommandItem
                                    className="h-12 px-2"
                                    value="remove-template"
                                    onSelect={() => {
                                        commit(undefined);
                                        setTplOpen(false);
                                    }}
                                >
                                    Remove template
                                </CommandItem>
                            }
                            {filtered.length === 0 ? (
                                <CommandEmpty>No templates found.</CommandEmpty>
                            ) : (
                                <CommandGroup>
                                    {filtered.map((tpl) => (
                                        <CommandItem
                                            key={tpl.id}
                                            value={tpl.id}
                                            className="h-12"
                                            onSelect={() => {
                                                commit(tpl.id);
                                                setTplOpen(false);
                                            }}
                                        >
                                            <div className="relative flex items-center gap-2">
                                                {tpl.iconKey && (
                                                    <TemplateIcon
                                                        className="size-6"
                                                        iconKey={tpl.iconKey}
                                                        strokeColor={tpl.strokeColor}
                                                        fillColor={tpl.fillColor}
                                                    />
                                                )}
                                                {tpl?.name ?? "Set template"}
                                            </div>
                                            {templateId === tpl.id ? (
                                                <Check className="ml-auto opacity-100" />
                                            ) : (
                                                <Check className="ml-auto opacity-0" />
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}


