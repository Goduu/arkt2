import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TbLineDashed } from "@/lib/icons/Icons";
import { Move } from "lucide-react";

type StrokeTypeProps = {
    value: string[],
    onChange: (types: string[]) => void
    hideAnimate?: boolean
}

export const StrokeType = ({ value, onChange, hideAnimate = false }: StrokeTypeProps) => {
    return (
        <div data-testid="edge-stroke-type-group">
            <label className="block text-xs text-muted-foreground mb-1">Stroke Type</label>
            <ToggleGroup
                variant="outline"
                type="multiple"
                value={value}
                onValueChange={onChange}
            >
                <ToggleGroupItem value="dashed" aria-label="dashed">
                    <TbLineDashed className="size-4" />
                </ToggleGroupItem>
                {!hideAnimate &&
                    <ToggleGroupItem value="animated" aria-label="animated">
                        <Move className="size-4" />
                    </ToggleGroupItem>
                }
            </ToggleGroup>

        </div>
    )
}