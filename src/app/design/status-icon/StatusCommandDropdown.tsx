import { useCommandStore } from "../commandStore";
import { Gamepad, Layers, LineSquiggle, Link } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNewDraftNode } from "@/components/nodes/arkt/utils";
import { StatusTooltip } from "./StatusTooltip";
import { Button } from "@/components/ui/button";

export const StatusCommandDropdown = () => {
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const { getNewDraftNode } = useNewDraftNode();

    return (
        <DropdownMenu>
            <StatusTooltip title="Open command palette" className="z-50 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" >
                <DropdownMenuTrigger asChild>
                    <Button size="icon" aria-label="Open command palette" className="inline-flex items-center">
                        <Gamepad />
                    </Button>
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