import { useMemo, useState, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Share2, Pencil, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useCommandStore } from "@/app/design/commandStore";
import useUserDataStateSynced from "./useUserStateSynced";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import useCursorStateSynced from "./useCursorStateSynced";
import { stringToColor } from "./utils";
import ydoc from "./ydoc";

export function CollabPopover() {
    const searchParams = useSearchParams();
    const collab = searchParams.get("collab")
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const { usersData } = useUserDataStateSynced()
    const [cursors, , , localName, updateLocalUserName] = useCursorStateSynced()

    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(localName);

    const onStartEdit = useCallback(() => {
        setDraftName(localName);
        setIsEditing(true);
    }, [localName]);

    const onCommitName = useCallback(() => {
        const name = draftName.trim();
        if (name.length > 0 && name !== localName) {
            updateLocalUserName(name);
        }
        setIsEditing(false);
    }, [draftName, localName, updateLocalUserName]);

    const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onCommitName();
        if (e.key === "Escape") setIsEditing(false);
    }, [onCommitName]);

    // Reliable self id from yjs doc
    const selfId = useMemo(() => ydoc.clientID.toString(), []);

    const participants = useMemo(() => {
        const cursorById = new Map(cursors.map(c => [c.id, c] as const));
        return usersData
            .map(u => {
                const cursor = cursorById.get(u.id);
                const isSelf = u.id === selfId;
                const name = isSelf ? localName : (cursor?.name || `User-${u.id.slice(-4)}`);
                const color = cursor?.color || stringToColor(u.id);
                return { id: u.id, name, color, isSelf };
            })
            .sort((a, b) => Number(b.isSelf) - Number(a.isSelf));
    }, [usersData, cursors, selfId, localName]);

    if (!collab) {
        return (
            <Button fillColor={{ family: "slate", indicative: "low" }} size="sm" variant="ghost" onClick={() => activateCommand("open-collab-dialog")}>
                <Share2 className="mr-2 h-4 w-4" /> Collab
            </Button>
        )
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm">
                    <Share2 className="mr-2 h-4 w-4" /> Collab
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-0 shadow-xs rounded-xs">
                <div className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm font-semibold">Live collaboration</div>
                            <div className="text-xs text-slate-500">{cursors.length} online</div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <ul className="space-y-2">
                            {participants.map((p) => (
                                <li key={p.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                                    <div className="h-7 w-7 rounded-full shadow-sm ring-2 ring-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p.color }}>
                                        {p.name.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                            {p.id === selfId ? (
                                                isEditing ? (
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Input
                                                            value={draftName}
                                                            onChange={(e) => setDraftName(e.target.value)}
                                                            onKeyDown={onKeyDown}
                                                            onBlur={onCommitName}
                                                            className="h-7 px-2 py-1 text-xs"
                                                            autoFocus
                                                        />
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCommitName}>
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <button className="inline-flex items-center gap-1 hover:underline" onClick={onStartEdit}>
                                                        <span>{localName}</span>
                                                        <Pencil className="h-3 w-3 text-slate-400" />
                                                    </button>
                                                )
                                            ) : (
                                                <span>{p.name}</span>
                                            )}
                                            {p.id === selfId ? <span className="text-[10px] font-semibold text-slate-500">(you)</span> : null}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
