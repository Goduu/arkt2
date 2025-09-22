import { useEffect, useMemo, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Plus } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { ArktNode } from "../types";
import { Button } from "@/components/ui/button";
import { useCommandStore } from "@/app/design/commandStore";
import { useNewDraftNode } from "../utils";
import { DEFAULT_FILL_COLOR } from "@/components/colors/utils";
import { NodeUnion } from "../../types";
import ydoc from "@/components/yjs/ydoc";
import { TemplateIcon } from "@/components/templates/TemplateIcon";
import { getNodePathLabelsFromNode } from "@/components/yjs/nodePathUtils";

export const nodesMap = ydoc.getMap<NodeUnion>('nodes');

export const AddVirtualDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const nodes = Array.from(nodesMap.values());
    const allNodes: ArktNode[] = useMemo(() => {
        return nodes.filter(node => node.type === "arktNode" && !node.data.virtualOf) as ArktNode[]
    }, [nodes])
    const openAddVirtualDialogCommand = useCommandStore((state) => state.commandMap["open-add-virtual-dialog"]);
    const removeCommand = useCommandStore((state) => state.removeCommand);
    const activateCommand = useCommandStore((state) => state.activateCommand);
    const { getNewDraftVirtualNode } = useNewDraftNode();
    const [virtualSelection, setVirtualSelection] = useState<ArktNode | null>(null);

    useEffect(() => {
        if (openAddVirtualDialogCommand.status === "pending") {
            setIsOpen(true);
            removeCommand("open-add-virtual-dialog");
        }
    }, [openAddVirtualDialogCommand])


    const handleClose = () => {
        setIsOpen(false);
    }

    const getNodePath = (node: ArktNode) => getNodePathLabelsFromNode(node)

    const handleAddVirtual = (node: ArktNode | null) => {
        if (!node) return;
        activateCommand("add-node", { nodes: [getNewDraftVirtualNode(node)] });
        handleClose();
    }

    return (
        <CommandDialog
            open={isOpen}
            onOpenChange={handleClose}
            title="Select a node"
            description="Search all nodes"
            showCloseButton
        >
            <CommandInput data-testid="virtual-dialog-search-input" placeholder="Search nodes by label or path..." />
            <CommandList className="h-72 overflow-y-scroll">
                <CommandEmpty>No nodes found.</CommandEmpty>
                <CommandGroup data-testid="virtual-dialog-list" heading="All Nodes" className="pt-2">
                    {allNodes.map((node) => {
                        const path = getNodePath(node);
                        return (
                            <CommandItem
                                key={node.id}
                                data-testid={`virtual-dialog-item-${node.data?.label || ""}`}
                                value={`${node.id} ${node.data?.label || ""} ${path.join(" -> ")}`}
                                onSelect={() => {
                                    setVirtualSelection(node);
                                }}
                                className="flex items-center justify-start gap-2 [&_svg]:!size-6"
                            >
                                <div className="relative size-6">
                                    <TemplateIcon
                                        className="size-6 p-0"
                                        iconKey={node.data?.iconKey}
                                        strokeColor={node.data?.strokeColor}
                                        fillColor={node.data?.fillColor}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <div className="font-medium truncate justify-start">{node.data?.label}</div>
                                    <div className="text-xs text-muted-foreground truncate">{path.join(" › ")}</div>
                                </div>
                                {virtualSelection?.id === node.id && (
                                    <Check className="ml-auto opacity-100" />
                                )}
                            </CommandItem>
                        );
                    })}
                </CommandGroup>
            </CommandList>
            <DialogFooter>
                <Button
                    data-testid="virtual-dialog-add-button"
                    fillColor={DEFAULT_FILL_COLOR}
                    className="z-10 p-4 flex items-center gap-2 m-2"
                    onClick={() => handleAddVirtual(virtualSelection)}
                    disabled={!virtualSelection}
                >
                    <Plus className="size-4" />
                    Add
                </Button>
            </DialogFooter>
        </CommandDialog>
    );
}
