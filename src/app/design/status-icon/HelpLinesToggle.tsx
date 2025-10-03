import { Button } from "@/components/ui/button"
import { Grid2X2Check } from "lucide-react"
import { useCommandStore } from "../commandStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const HelpLinesToggle = () => {
    const helpLinesCommand = useCommandStore((s) => s.commandMap["help-lines-toggle"]);
    const toggleCommand = useCommandStore((s) => s.toggleCommand);

    return (
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <Button
                    size="icon"
                    onClick={() => toggleCommand("help-lines-toggle")}
                    className={cn(
                        helpLinesCommand.status === "active" ?
                            "opacity-95" :
                            "opacity-50 hover:opacity-100"
                    )}
                >
                    <Grid2X2Check />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                {helpLinesCommand.status === "inactive" ? "Enable help lines" : "Disable Helper Lines"}
            </TooltipContent>
        </Tooltip>

    )
}