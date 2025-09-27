import { useCommandStore } from "../commandStore";
import { Blocks, Layers, LineSquiggle, Link, Text, Type } from "lucide-react";
import { StatusTooltip } from "./StatusTooltip";
import { Gamepad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMetaKeyLabel } from "@/hooks/use-meta-key";

export const StatusIcon = () => {
    const latestCommand = useCommandStore((s) => s.latestCommand);
    const draggingNodeCommand = useCommandStore((s) => s.commandMap["dragging-node"]);
    const removeCommand = useCommandStore((s) => s.removeCommand);
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const metaKey = useMetaKeyLabel();

    switch (latestCommand) {
        case "freehand-mode":
            return (
                <StatusTooltip title="Cancel: Freehand mode" className="p-1.5" shortcut="esc" onClick={() => removeCommand("freehand-mode")}>
                    <LineSquiggle />
                </StatusTooltip>
            )
        case "dragging-node":
            if (draggingNodeCommand.data?.type === "text") {
                return (
                    <StatusTooltip title="Cancel: Add text" className="p-1.5" shortcut="esc" onClick={() => removeCommand("dragging-node")}>
                        <Type />
                    </StatusTooltip>
                )
            }
            if (draggingNodeCommand.data?.type === "integration") {
                return (
                    <StatusTooltip title="Cancel: Add integration" className="p-1.5" shortcut="esc" onClick={() => removeCommand("dragging-node")}>
                        <Blocks />
                    </StatusTooltip>
                )
            }
            if (draggingNodeCommand.data?.type === "virtual") {
                return (
                    <StatusTooltip title="Cancel: Add virtual" className="p-1.5" shortcut="esc" onClick={() => removeCommand("dragging-node")}>
                        <Link />
                    </StatusTooltip>
                )
            }
            return (
                <StatusTooltip title="Cancel: Add node" className="p-1.5" shortcut="esc" onClick={() => removeCommand("dragging-node")}>
                    <Layers />
                </StatusTooltip>
            )
        default:
            return (
                <StatusTooltip title={`Open command palette (${metaKey}+k)`} className="z-50 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" >
                    <Button
                        size="icon"
                        aria-label="Open command palette"
                        className="inline-flex items-center"
                        onClick={() => activateCommand("open-command-palette")}>
                        <Gamepad />
                    </Button>
                </StatusTooltip>
            )
    }
}

