import { Button } from "@/components/ui/button"
import { Grid2X2Check } from "lucide-react"
import { useCommandStore } from "../commandStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const HelpLinesToggle = () => {
    const helpLinesCommand = useCommandStore((s) => s.commandMap["help-lines-toggle"]);
    const toggleCommand = useCommandStore((s) => s.toggleCommand);

    return (
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    onClick={() => toggleCommand("help-lines-toggle")}
                    className={helpLinesCommand.status === "active" ? "opacity-100" : "opacity-50"}
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