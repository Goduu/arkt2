import { Button } from "@/components/ui/button";
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
                <Button onClick={onClick} size="icon" className={className}>
                    {children}
                    <div className="absolute bottom-0 right-0 text-[5px]">
                        {shortcut}
                    </div>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                {title}
            </TooltipContent>
        </Tooltip>
    )
}