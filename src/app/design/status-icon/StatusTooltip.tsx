import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

type StatusTooltipProps = {
    title: string;
    shortcut?: string;
    className?: string;
    onClick?: () => void;
    children: ReactNode;
}

export const StatusTooltip = ({ title, className, shortcut, onClick, children }: StatusTooltipProps) => {
    return (
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <SketchyPanel className={className} onClick={onClick}>
                    {children}
                    <div className="absolute bottom-0 right-0 text-[5px]">
                        {shortcut}
                    </div>
                </SketchyPanel>
            </TooltipTrigger>
            <TooltipContent side="right">
                {title}
            </TooltipContent>
        </Tooltip>
    )
}