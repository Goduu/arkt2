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
import { copyCurrentDocToLocalRoom, disconnectProvider } from "./ydoc";
import { usePathname, useRouter } from "next/navigation";
import { useMounted } from "@/app/useMounted";

export function CollabPopover() {
    const searchParams = useSearchParams();
    const collab = searchParams.get("collab")
    const router = useRouter();
    const pathname = usePathname();
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const { usersData } = useUserDataStateSynced()
    const [cursors, , , localName, updateLocalUserName] = useCursorStateSynced()
    const mounted = useMounted();

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

    const onDisconnect = useCallback(async () => {
        await copyCurrentDocToLocalRoom().catch(() => undefined);
        await disconnectProvider();
        const params = new URLSearchParams(searchParams);
        params.delete('collab');
        router.push(`${pathname}${params.size ? `?${params.toString()}` : ''}`);
    }, [searchParams, router, pathname]);

     // Avoid SSR hydration mismatches from Popover (Radix useId) by only rendering it client-side
     if (collab && !mounted) {
        return null;
    }

    if (!collab) {
        return (
            <Button size="sm" variant="ghost" onClick={() => activateCommand("open-collab-dialog")}>
                <Share2 className="mr-2 h-4 w-4" />
                <span className="hidden md:block">
                    Collab
                </span>
            </Button>
        )
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Collab
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-0 shadow-xs rounded-xs">
                <div className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm font-semibold">Live collaboration</div>
                            <div className="text-xs text-slate-500">{cursors.length} online</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={onDisconnect}>Disconnect</Button>
                    </div>

                    <div className="mt-4">
                        <ul className="list-none space-y-2">
                            {participants.map((p) => (
                                <li key={p.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-500/10 transition-colors cursor-pointer" onClick={() => onStartEdit()}>
                                    <div className="h-7 w-7 rounded-full shadow-sm ring-2 ring-white flex items-center justify-center text-xs font-bold" style={{ backgroundColor: p.color }}>
                                        {p.name.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium flex justify-between items-center gap-2">
                                            {p.id === selfId ? (
                                                isEditing ? (
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Input
                                                            value={draftName}
                                                            onChange={(e) => setDraftName(e.target.value)}
                                                            onKeyDown={onKeyDown}
                                                            onBlur={onCommitName}
                                                            className="h-7 px-2 py-1 text-xs"
                                                            hideStroke
                                                            autoFocus
                                                        />
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCommitName}>
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <button className="inline-flex items-center gap-1 hover:underline" onClick={onStartEdit}>
                                                        <span>{localName}</span>
                                                        <Pencil className="h-3 w-3" />
                                                    </button>
                                                )
                                            ) : (
                                                <span>{p.name}</span>
                                            )}
                                            {p.id === selfId ? <span className="text-[10px] font-semibold">(you)</span> : null}
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
