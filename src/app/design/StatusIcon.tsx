import { ReactNode } from "react";
import { useCommandStore } from "./commandStore";
import { Layers, LineSquiggle, Link, SquareDashedTopSolid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNewDraftNode } from "@/components/nodes/arkt/utils";

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
                <CommandDropdown />
            )
    }


}

const CommandDropdown = () => {
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const { getNewDraftNode } = useNewDraftNode();

    return (
        <DropdownMenu>
            <StatusTooltip title="Open command palette" className="z-50 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" >
                <DropdownMenuTrigger asChild>
                    <SquareDashedTopSolid />
                </DropdownMenuTrigger>
            </StatusTooltip>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => activateCommand("add-node", { nodes: [getNewDraftNode()] })}>
                    <Layers />
                    <span>Add node</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => activateCommand("freehand-mode")}>
                    <LineSquiggle />
                    <span>Freehand mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => activateCommand("open-add-virtual-dialog")}>
                    <Link />
                    <span>Add virtual node</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

type StatusTooltipProps = {
    title: string;
    shortcut?: string;
    className?: string;
    onClick?: () => void;
    children: ReactNode;
}

const StatusTooltip = ({ title, className, shortcut, onClick, children }: StatusTooltipProps) => {
    return (
        <Tooltip delayDuration={300}>
            <TooltipTrigger title={title} onClick={onClick}>
                <SketchyPanel className={className}>
                    {children}
                    <div className="absolute bottom-0 right-0 text-[5px]">
                        {shortcut}
                    </div>
                </SketchyPanel>
            </TooltipTrigger>
            <TooltipContent side="right">
                {title}
            </TooltipContent>
        </Tooltip>
    )
}