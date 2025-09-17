import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MoveHorizontal, MoveLeft, MoveRight } from "lucide-react";

type EdgeMarkerProps = {
    value: "start" | "end" | "both" | "";
    onChange: (direction: "start" | "end" | "both" | "") => void
}

export const EdgeMarker = ({ value, onChange }: EdgeMarkerProps) => {
    return (
        <div data-testid="edge-direction-group">
            <label className="block text-xs text-muted-foreground mb-1">Direction</label>
            <ToggleGroup
                variant="outline"
                type="single"
                value={value}
                onValueChange={onChange}
            >
                <ToggleGroupItem value="end" aria-label="end">
                    <MoveRight className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="start" aria-label="start">
                    <MoveLeft className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="both" aria-label="both">
                    <MoveHorizontal className="size-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    )
}