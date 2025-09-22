"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { MentionOption } from "./types";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type MentionsInputProps = {
    mentions: MentionOption[];
    placeholder?: string;
    onChange?: (value: string, mentions: MentionOption[]) => void;
    dataTestIds?: { editor?: string };
    className?: string;
    ref?: React.RefObject<HTMLDivElement | null>;
};

export function MentionsInput({ mentions = [], placeholder = "Type @ to mention", onChange, dataTestIds, className, ref }: MentionsInputProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [filteredMentions, setFilteredMentions] = useState<MentionOption[]>(mentions);

    const [commandQuery, setCommandQuery] = useState<string>("");
    const [mentionStart, setMentionStart] = useState<number>(0);

    const interactingWithPopoverRef = useRef<boolean>(false);

    useEffect(() => {
        if (commandQuery) {
            const filtered = mentions.filter((m) => m.label.toLowerCase().includes(commandQuery.toLowerCase()));
            setFilteredMentions(filtered);
        } else {
            setFilteredMentions(mentions);
        }
    }, [commandQuery, mentions]);

    const getMentionedEntities = useCallback((): MentionOption[] => {
        if (!ref?.current) return [];
        const spans = ref.current.querySelectorAll<HTMLSpanElement>(".mention");
        return Array.from(spans).map((span) => ({
            id: span.getAttribute("data-id") ?? "",
            label: span.getAttribute("data-label") ?? "",
        }));
    }, []);

    const emitChange = useCallback(() => {
        if (!onChange || !ref?.current) return;
        const text = ref.current.innerText;
        onChange(text, getMentionedEntities());
    }, [getMentionedEntities, onChange]);

    function selectionIsInsideEditor(): boolean {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        const anchorNode = sel.anchorNode;
        if (!anchorNode) return false;
        return !!ref?.current && ref.current.contains(anchorNode);
    }

    function evaluateMentionTrigger(): void {
        const editor = ref?.current;
        if (!editor) return;
        const selection = window.getSelection();
        if (!selection || !selection.isCollapsed || !selectionIsInsideEditor()) {
            setIsOpen(false);
            setCommandQuery("");
            return;
        }

        // Compute caret global index within editor
        let caretIndex: number | null = null;
        try {
            const range = document.createRange();
            range.setStart(editor, 0);
            range.setEnd(selection.focusNode as Node, selection.focusOffset ?? 0);
            caretIndex = range.toString().length;
        } catch {
            caretIndex = null;
        }
        if (caretIndex == null) {
            setIsOpen(false);
            return;
        }
        const editorText = editor.innerText;
        const textBefore = editorText.slice(0, caretIndex);
        const atIndex = textBefore.lastIndexOf('@');
        if (atIndex === -1) {
            setIsOpen(false);
            return;
        }

        const globalAtIndex = atIndex;
        const charBeforeAt = globalAtIndex > 0 ? editorText[globalAtIndex - 1] : ' ';
        const queryAfterAt = editorText.slice(globalAtIndex + 1, caretIndex);
        const isWordBoundary = charBeforeAt === ' ' || charBeforeAt === '\n' || charBeforeAt === '\t';
        const isLettersOnly = /^[A-Za-z]*$/.test(queryAfterAt);

        if (isWordBoundary && isLettersOnly) {
            setCommandQuery(queryAfterAt);
            setMentionStart(globalAtIndex);
            setIsOpen(true);
            return;
        }

        setIsOpen(false);
        setCommandQuery("");
    }

    function handleInput(): void {
        evaluateMentionTrigger();
        emitChange();
    }

    function selectMention(mention: MentionOption): void {
        const editor = ref?.current;
        if (!editor) return;
        const selection = window.getSelection();
        const range = document.createRange();
        const textContent = editor.innerText;
        const beforeMention = textContent.slice(0, mentionStart);
        const afterMention = textContent.slice(mentionStart + commandQuery.length + 1);

        editor.innerHTML = "";
        if (beforeMention) editor.appendChild(document.createTextNode(beforeMention));

        const mentionSpan = document.createElement("span");
        mentionSpan.className = "mention";
        mentionSpan.setAttribute("data-id", mention.id);
        mentionSpan.setAttribute("data-label", mention.label);
        mentionSpan.style.backgroundColor = "#e3f2fd";
        mentionSpan.style.color = "#1976d2";
        mentionSpan.style.padding = "2px 4px";
        mentionSpan.style.borderRadius = "3px";
        mentionSpan.style.marginRight = "2px";
        mentionSpan.contentEditable = "false";
        mentionSpan.textContent = `@${mention.label}`;
        editor.appendChild(mentionSpan);
        editor.appendChild(document.createTextNode(" "));

        if (afterMention) editor.appendChild(document.createTextNode(afterMention));

        range.setStartAfter(mentionSpan.nextSibling || mentionSpan);
        range.setEndAfter(mentionSpan.nextSibling || mentionSpan);
        selection?.removeAllRanges();
        selection?.addRange(range);

        setIsOpen(false);
        setCommandQuery("");
        editor.focus();
        emitChange();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
        if (!isOpen) return;
        if (e.key === "Escape") {
            e.preventDefault();
            setIsOpen(false);
            setCommandQuery("");
        }
    }

    // Keep trigger evaluation in sync when the caret moves without input (e.g., mouse, arrows)
    useEffect(() => {
        function onSelectionChange(): void {
            if (interactingWithPopoverRef.current) return;
            evaluateMentionTrigger();
        }
        document.addEventListener('selectionchange', onSelectionChange);
        return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, []);

    return (
        <div className="relative w-full">
            <div className="relative rounded-md">
                <div
                    ref={ref}
                    contentEditable
                    className={cn(
                        "w-full py-1.5 rounded-md bg-background text-foreground",
                        className,
                        "focus:outline-none focus:ring-0 focus:ring-ring text-sm",
                        isOpen && "max-h-48"
                    )}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
                    suppressContentEditableWarning={true}
                    data-placeholder={placeholder}
                    data-testid={dataTestIds?.editor}
                />
                <style>
                    {`
                    [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events: none;
                    }
                    `}
                </style>

                <Popover
                    open={isOpen && filteredMentions.length > 0}
                    onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) {
                            setCommandQuery("");
                        }
                    }}
                >
                    <PopoverAnchor asChild>
                        <div className="absolute top-0 left-0" />
                    </PopoverAnchor>
                    <PopoverContent
                        className="p-0 w-60"
                        align="start"
                        onOpenAutoFocus={(e) => { e.preventDefault(); }}
                        onMouseDown={() => { interactingWithPopoverRef.current = true; }}
                        onMouseUp={() => { interactingWithPopoverRef.current = false; }}
                    >
                        <Command shouldFilter={false} value={commandQuery}>
                            <CommandList>
                                <CommandGroup>
                                    {filteredMentions.map((m) => (
                                        <CommandItem
                                            key={m.id}
                                            value={m.id}
                                            onSelect={() => selectMention(m)}
                                            onClick={() => selectMention(m)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{m.label}</span>
                                                <span className="text-xs text-muted-foreground">ID: {m.id}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}