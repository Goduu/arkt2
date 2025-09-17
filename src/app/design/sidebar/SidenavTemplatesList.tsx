import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import type { NodeTemplate } from "@/lib/types";
import { Ellipsis } from "lucide-react";
import { TemplateButton } from "./TemplateButton";

export interface SidenavTemplatesListProps {
    nodeTemplates: Record<string, NodeTemplate>;
    onSpawn: (templateId: string) => void;
}

const MAX_RECENT_TEMPLATES = 5;

export function SidenavTemplatesList({ nodeTemplates, onSpawn }: SidenavTemplatesListProps) {
    const templates = Object.values(nodeTemplates)
        .slice()
        .sort((a, b) => {
            const ta = typeof a.lastUsedAt === "number" ? a.lastUsedAt : (a.updatedAt ?? 0);
            const tb = typeof b.lastUsedAt === "number" ? b.lastUsedAt : (b.updatedAt ?? 0);
            return tb - ta;
        });

    const recent = templates.slice(0, MAX_RECENT_TEMPLATES);
    const rest = templates.slice(MAX_RECENT_TEMPLATES);

    return (
        <>
            {recent.map((tpl) => (
                <TemplateButton key={tpl.id} tpl={tpl} onSpawn={onSpawn} />
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
                                <TemplateButton key={tpl.id} tpl={tpl} onSpawn={onSpawn} />
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            ) : null
            }
        </>
    );
}

export default SidenavTemplatesList;


