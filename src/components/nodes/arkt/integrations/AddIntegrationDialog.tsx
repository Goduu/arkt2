import { useEffect, useState } from "react";
import { Figma, Github } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCommandStore } from "@/app/design/commandStore";
import { NodeUnion } from "../../types";
import ydoc from "@/components/yjs/ydoc";
import { Integration } from "@/components/controls/IntegrationSelector";
import { useNewDraftNode } from "../utils";

export const nodesMap = ydoc.getMap<NodeUnion>('nodes');

export const AddIntegrationDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const openAddIntegrationDialogCommand = useCommandStore((state) => state.commandMap["open-add-integration-dialog"]);
    const removeCommand = useCommandStore((state) => state.removeCommand);
    const activateCommand = useCommandStore((state) => state.activateCommand);
    const { getNewDraftIntegrationNode } = useNewDraftNode();

    useEffect(() => {
        console.log("openAddIntegrationDialogCommand", openAddIntegrationDialogCommand);
        if (openAddIntegrationDialogCommand.status === "pending") {
            setIsOpen(true);
            removeCommand("open-add-integration-dialog");
        }
    }, [openAddIntegrationDialogCommand])

    const handleAddIntegration = (integration: Integration) => {
        activateCommand("add-node", { nodes: [getNewDraftIntegrationNode(integration)] });
        setIsOpen(false);
    }


    return (
        <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Integration</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleAddIntegration("github")}
                        className="flex flex-col items-center p-4 gap-2 size-32"
                    >
                        <Github />
                        GitHub
                    </Button>
                    <Button
                        onClick={() => handleAddIntegration("figma")}
                        className="flex flex-col items-center p-4 gap-2 size-32"
                    >
                        <Figma />
                        Figma
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
