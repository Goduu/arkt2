import { TemplateData } from "@/components/templates/types";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { TemplateIcon } from "@/components/templates/TemplateIcon";

export function TemplateButton({ tpl, onSpawn }: { tpl: TemplateData, onSpawn: (templateId: string) => void }) {
    return (
        <SidebarMenuItem key={tpl.id}>
            <SidebarMenuButton
                data-testid={`template-icon-${tpl.name}`}
                tooltip={tpl.name}
                onClick={() => onSpawn(tpl.id)}
            >
                <div className="flex items-center gap-2">
                    {/* {tpl.iconKey ? ( */}
                        <div className="relative size-6 -ml-1">
                            <TemplateIcon
                                className="size-6"
                                iconKey={tpl.iconKey}
                                strokeColor={tpl.strokeColor}
                                fillColor={tpl.fillColor}
                            />
                        </div>
                    {/* ) : null} */}
                    <span className="group-data-[collapsible=icon]:hidden">{tpl.name}</span>
                </div>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}