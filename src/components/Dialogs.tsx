"use client"
import { useEffect, useState } from "react";
import { TemplatesManagerDialog } from "./templates/TemplatesManagerDialog";
import { useAppStore } from "@/app/design/store";
import { CreateTemplateDialog } from "./templates/CreateTemplateDialog";

export const Dialogs = () => {
    const [isTemplatesManagerOpen, setIsTemplatesManagerOpen] = useState<boolean>(false);
    const { removeCommand } = useAppStore();
    const openTemplatesManagerCommand = useAppStore((s) => s.commandMap["open-templates-manager"]);
    const createTemplateDialogCommand = useAppStore((s) => s.commandMap["open-create-template"]);
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);


    useEffect(() => {
        if (openTemplatesManagerCommand.status === "pending") {
            setIsTemplatesManagerOpen(true);
            removeCommand("open-templates-manager");
        }
    }, [openTemplatesManagerCommand]);

    useEffect(() => {
        if (createTemplateDialogCommand.status === "pending") {
            setIsCreateOpen(true);
            console.log("createTemplateDialogCommand", createTemplateDialogCommand);
            removeCommand("open-create-template");
        }
    }, [createTemplateDialogCommand]);

    return (
        <>
            <TemplatesManagerDialog isOpen={isTemplatesManagerOpen} onClose={() => setIsTemplatesManagerOpen(false)} />
            <CreateTemplateDialog 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                mode={createTemplateDialogCommand.data?.templateId ? "edit" : "create"}
                templateId={createTemplateDialogCommand.data?.templateId} 
            />
        </>
    );
};