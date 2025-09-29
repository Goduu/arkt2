"use client"
import { TemplatesManagerDialog } from "./templates/TemplatesManagerDialog";
import { CreateTemplateDialog } from "./templates/CreateTemplateDialog";
import { AddVirtualDialog } from "./nodes/arkt/virtual/AddVirtualDialog";
import GithubFileDialog from "./controls/node-controls/GithubFileDialog";
import FigmaLinkDialog from "./controls/node-controls/FigmaLinkDialog";
import ExportDialog from "@/app/design/top-bar/ExportDialog";
import ImportDialog from "@/app/design/top-bar/ImportDialog";
import { AddIntegrationDialog } from "./nodes/integrations/AddIntegrationDialog";
import CollabDialog from "./yjs/CollabDialog";

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
            <CollabDialog />
        </>
    );
};