import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Ellipsis } from "lucide-react";
import { TemplateButton } from "./TemplateButton";
import { useCommandStore } from "../commandStore";
import { useNewDraftNode } from "@/components/nodes/arkt/utils";
import { TemplateData } from "@/components/templates/types";

export interface SidenavTemplatesListProps {
    nodeTemplates: TemplateData[]
}

const MAX_RECENT_TEMPLATES = 5;

export function SidenavTemplatesList({ nodeTemplates }: SidenavTemplatesListProps) {
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const { getNewDraftNode } = useNewDraftNode();
    const templates = Object.values(nodeTemplates)
        .slice()
        .sort((a, b) => {
            const ta = typeof a.lastUsedAt === "number" ? a.lastUsedAt : (a.updatedAt ?? 0);
            const tb = typeof b.lastUsedAt === "number" ? b.lastUsedAt : (b.updatedAt ?? 0);
            return tb - ta;
        });

    const recent = templates.slice(0, MAX_RECENT_TEMPLATES);
    const rest = templates.slice(MAX_RECENT_TEMPLATES);

    const handleAddTemplate = (templateId: string) => {
        const template = nodeTemplates.find((tpl) => tpl.id === templateId);
        if (template) {
            activateCommand("add-node", { nodes: [getNewDraftNode(template)] });
        }
    }

    return (
        <div className="flex flex-col">
            {recent.map((tpl) => (
                <TemplateButton key={tpl.id} tpl={tpl} onSpawn={handleAddTemplate} />
            ))
            }
            {rest.length > 0 ? (
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton>
                                <Ellipsis />
                                <span className="group-data-[collapsible=icon]:hidden">More</span>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                            {rest.map((tpl) => (
                                <TemplateButton key={tpl.id} tpl={tpl} onSpawn={handleAddTemplate} />
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            ) : null
            }
        </div>
    );
}

export default SidenavTemplatesList;


