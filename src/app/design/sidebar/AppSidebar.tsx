"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup, SidebarGroupAction, SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton,
    SidebarMenuItem, SidebarRail,
    SidebarSeparator,
    SidebarTrigger
} from "@/components/ui/sidebar"
import {
    Home, FileText, Settings,
    Plus,
    LineSquiggle,
    Layers,
    LinkIcon,
    Type,
    Blocks
} from "lucide-react"
import Link from "next/link"
import { Collapsible } from "@/components/ui/collapsible"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useMounted } from "@/app/useMounted"
import { useCommandStore } from "../commandStore"
import SidenavTemplatesList from "./SidenavTemplatesList"
import useTemplatesStateSynced from "@/components/yjs/useTemplatesStateSynced"
import { useNewDraftNode } from "@/components/nodes/arkt/utils"
import { ModeToggle } from "@/components/ModeToggle"

export function AppSidebar() {
    // const { nodeTemplates, setPendingSpawn, setPendingCommand } = useAppStore()
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const [templates] = useTemplatesStateSynced();
    const { getNewDraftNode, getNewDraftTextNode } = useNewDraftNode();

    const { resolvedTheme } = useTheme()
    const mounted = useMounted()

    const pathName = usePathname();
    const isHomePage = pathName === "/design";
    const isSettingsPage = pathName === "/design/settings";

    if (isSettingsPage) {
        return (
            <Sidebar collapsible="icon" side="left" className="overflow-hidden" variant="sidebar">
                <SidebarHeader>
                    <Link href="/" className="flex gap-4 px-2 items-center w-full justify-start group-data-[collapsible=icon]:justify-center">
                        {mounted && <Image src={`/arkt-logo-${resolvedTheme}.svg`} alt="ArkT" width={32} height={32} />}
                        <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">ArkT</span>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <Collapsible defaultOpen className="group/collapsible">
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Home" isActive={isHomePage}>
                                            <Link href="/design">
                                                <Home />
                                                <span>Home</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Settings" isActive={isSettingsPage}>
                                            <Link href="/design/settings">
                                                <Settings />
                                                <span>Settings</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </Collapsible>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>


                </SidebarContent>

                <SidebarFooter>
                    <ModeToggle />
                    <SidebarTrigger className="opacity-50 hover:opacity-100" />
                </SidebarFooter>

                <SidebarRail />
            </Sidebar >
        )
    }

    return (
        <Sidebar collapsible="icon" side="left" className="overflow-hidden" variant="sidebar">
            <SidebarHeader>
                <Link href="/" className="flex gap-4 px-2 items-center w-full justify-start group-data-[collapsible=icon]:justify-center">
                    {mounted ? <Image src={`/arkt-logo-${resolvedTheme}.svg`} alt="ArkT" width={32} height={32} /> : <div className="size-8" />}
                    <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">ArkT</span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible defaultOpen className="group/collapsible">
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Home" isActive={isHomePage}>
                                        <Link href="/design">
                                            <Home />
                                            <span>Home</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {/* <SidebarMenuItem>
                                    <SidebarMenuButton data-testid="sidebar-diagrams-button" tooltip="Diagrams" onClick={() => setPendingCommand({ type: "openDiagrams" })}>
                                        <Layers />
                                        <span>Diagrams</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem> */}
                                <SidebarMenuItem>
                                    <SidebarMenuButton tooltip="Templates" onClick={() => activateCommand("open-templates-manager")}>
                                        <FileText />
                                        <span>Templates</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Settings" isActive={isSettingsPage}>
                                        <Link href="/design/settings">
                                            <Settings />
                                            <span>Settings</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Add</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    data-testid="add-text"
                                    tooltip="Add Text"
                                    onClick={() => activateCommand("add-node", { nodes: [getNewDraftTextNode()] })}
                                >
                                    <Type />
                                    <span>Add text</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Add Line" onClick={() => activateCommand("freehand-mode")}>
                                <LineSquiggle />
                                <span>Add line</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton data-testid="add-node" tooltip="Add Node" onClick={() => activateCommand("add-node", { nodes: [getNewDraftNode()] })}>
                                <Layers />
                                <span>Add node</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                data-testid="sidebar-add-virtual-node-button"
                                tooltip="Add Virtual Node"
                                onClick={() => activateCommand("open-add-virtual-dialog")}
                            >
                                <LinkIcon />
                                <span>Add virtual node</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                data-testid="sidebar-add-virtual-node-button"
                                tooltip="Add Virtual Node"
                                onClick={() => activateCommand("open-add-integration-dialog")}
                            >
                                <Blocks />
                                <span>Add Integration</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarSeparator />

                        <SidebarGroup className="flex-1">
                            <SidebarGroupLabel className="-ml-2">Templates</SidebarGroupLabel>
                            <SidebarGroupAction title="Create Template" onClick={() => activateCommand("open-create-template")}>
                                <Plus /> <span className="sr-only">Create Template</span>
                            </SidebarGroupAction>
                        </SidebarGroup>
                        <SidebarMenuItem className="group-data-[collapsible=icon]:block hidden">
                            <SidebarMenuButton tooltip="Create Template" onClick={() => activateCommand("open-create-template")}>
                                <Plus /> <span>Create Template</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidenavTemplatesList
                            nodeTemplates={templates}
                        />
                        {/* </SidebarMenu>  */}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <ModeToggle className="-ml-1"/>
                <SidebarTrigger className="opacity-50 hover:opacity-100" />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar >
    )
}