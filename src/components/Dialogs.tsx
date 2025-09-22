"use client"
import { TemplatesManagerDialog } from "./templates/TemplatesManagerDialog";
import { CreateTemplateDialog } from "./templates/CreateTemplateDialog";
import { AddVirtualDialog } from "./nodes/arkt/virtual/AddVirtualDialog";

export const Dialogs = () => {

    return (
        <>
            <TemplatesManagerDialog />
            <CreateTemplateDialog />
            <AddVirtualDialog />
        </>
    );
};