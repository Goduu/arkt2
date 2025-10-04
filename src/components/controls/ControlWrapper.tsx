"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { SketchyPanel } from "../sketchy/SketchyPanel";
import SketchySideBorder from "../sketchy/SketchySideBorder";
import { ControlDrawer } from "./ControlDrawer";
import { Button } from "../ui/button";
import { FolderInput } from "lucide-react";
import { NodeUnion } from "../nodes/types";
import { ArktEdge } from "../edges/ArktEdge/type";
import useUserDataStateSynced from "../yjs/useUserStateSynced";
import { useReactFlow } from "@xyflow/react";

type ControlWrapperProps = {
    children: ReactNode;
    title: string;
    testId: string;
    selectedNodes?: NodeUnion[];
    selectedEdge?: ArktEdge;
}

export function ControlWrapper({ children, title, testId, selectedNodes }: ControlWrapperProps) {
    const { fitView } = useReactFlow();
    const { onDiagramDrillDown, onDiagramDrillToNode } = useUserDataStateSynced(fitView);

    const handleNavigateClick = () => {
        const firstSelectedNode = selectedNodes?.[0];
        if (!firstSelectedNode) return;
        if (firstSelectedNode.type !== "arktNode") return;
        const data = firstSelectedNode.data;

        if (data.virtualOf) {
            onDiagramDrillToNode(data.virtualOf);
        }
        onDiagramDrillDown(firstSelectedNode.id, firstSelectedNode.data.label);
    }

    return (
        <>
            <div
                className={cn(
                    "fixed top-16 right-4 w-60 overflow-auto bg-background",
                    "shadow-lg rounded-md transition-all duration-1000",
                    "overflow-auto hidden md:block",
                )}
                data-testid={testId}
            >
                <SketchyPanel>
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue={testId}
                    >
                        <AccordionItem value={testId}>
                            <AccordionTrigger
                                data-testid={`${testId}-toggle`}
                                className={cn("relative px-3 py-2")}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div className="text-sm font-medium">{title}</div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="relative overflow-scroll" >
                                <div
                                    className="p-3 space-y-3 text-sm overflow-hidden"
                                    data-testid={`${testId}-content`}
                                >
                                    <SketchySideBorder strokeWidth={1} side="top" className="z-10" />
                                    {children}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </SketchyPanel>
            </div >
            <div className="block md:hidden">
                <ControlDrawer>
                    {children}
                </ControlDrawer>
                <Button variant="outline" size="icon" className="absolute top-12 right-2" onClick={handleNavigateClick}>
                    <FolderInput />
                </Button>
            </div>
        </>
    )
}