"use client"
import { TemplatesManagerDialog } from "./templates/TemplatesManagerDialog";
import { CreateTemplateDialog } from "./templates/CreateTemplateDialog";
import { AddVirtualDialog } from "./nodes/arkt/virtual/AddVirtualDialog";
import GithubFileDialog from "./controls/node-controls/GithubFileDialog";
import FigmaLinkDialog from "./controls/node-controls/FigmaLinkDialog";
import ExportDialog from "@/app/design/topbar/ExportDialog";
import ImportDialog from "@/app/design/topbar/ImportDialog";
import { AddIntegrationDialog } from "./nodes/arkt/integrations/AddIntegrationDialog";

export const Dialogs = () => {

    return (
        <>
            <TemplatesManagerDialog />
            <CreateTemplateDialog />
            <AddVirtualDialog />
            <GithubFileDialog />
            <FigmaLinkDialog />
            <ExportDialog />
            <ImportDialog />
            <AddIntegrationDialog />
        </>
    );
};