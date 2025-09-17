"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { SketchyPanel } from "../sketchy/SketchyPanel";
import SketchySideBorder from "../sketchy/SketchySideBorder";

type ControlWrapperProps = {
    children: ReactNode;
    title: string;
    testId: string;
}

export function ControlWrapper({ children, title, testId }: ControlWrapperProps) {
    return (
        <div
            className={cn(
                "fixed top-16 right-4 w-60 overflow-auto bg-background",
                "shadow-lg rounded-md transition-all duration-1000",
                "overflow-auto",
            )}
        >
            <SketchyPanel>
                <Accordion
                    type="single"
                    collapsible
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
                        <AccordionContent className="relative overflow-scroll">
                            <div
                                className="p-3 space-y-3 text-sm overflow-hidden"
                                data-testid={`${testId}-content`}
                            >
                                <SketchySideBorder side="top" className="z-10" />
                                {children}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </SketchyPanel>
        </div >
    )
}