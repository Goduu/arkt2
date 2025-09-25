import { useCommandStore } from "../commandStore";
import { Layers, LineSquiggle } from "lucide-react";
import { StatusTooltip } from "./StatusTooltip";
import { StatusCommandDropdown } from "./StatusCommandDropdown";

export const StatusIcon = () => {
    const latestCommand = useCommandStore((s) => s.latestCommand);
    const removeCommand = useCommandStore((s) => s.removeCommand);

    switch (latestCommand) {
        case "freehand-mode":
            return (
                <StatusTooltip title="Cancel: Freehand mode" onClick={() => removeCommand("freehand-mode")}>
                    <LineSquiggle />
                </StatusTooltip>
            )
        case "dragging-node":
            return (
                <StatusTooltip title="Cancel: Add node" shortcut="esc" onClick={() => removeCommand("dragging-node")}>
                    <Layers />
                </StatusTooltip>
            )
        default:
            return (
                <StatusCommandDropdown />
            )
    }


}

