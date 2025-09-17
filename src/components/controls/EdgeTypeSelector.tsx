import { Spline } from "lucide-react";
import { IoAnalyticsOutline, TbLine } from "@/lib/icons/Icons";
import { Algorithm } from "../edges/ArktEdge/constants";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

type EdgeTypeSelectorProps = {
    selectedStrokeType?: string | null;
    onChange: (algorithm?: Algorithm) => void;
    options?: EdgeTypeOption[];
}

export function EdgeTypeSelector({ selectedStrokeType, onChange, options = EDGE_TYPES }: EdgeTypeSelectorProps) {

    return (
        <div data-testid="edge-type-group">
            <label className="block text-xs text-muted-foreground mb-1">Type</label>
            <ToggleGroup
                variant="outline"
                type="single"
                value={selectedStrokeType ?? ""}
                onValueChange={(value) => onChange(value as Algorithm ?? null)}
            >
                {options.map((option) => (
                    <ToggleGroupItem key={option.value} value={option.value} aria-label={option.value}>
                        <option.icon className="size-4" />
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}

export const EDGE_TYPES: EdgeTypeOption[] = [
    {
        value: Algorithm.Linear,
        label: "Straight",
        icon: TbLine,
    },
    {
        value: Algorithm.BezierCatmullRom,
        label: "Bezier",
        icon: Spline,
    },
    {
        value: Algorithm.CatmullRom,
        label: "Step",
        icon: IoAnalyticsOutline,
    },
]

type EdgeTypeOption = {
    value: NonNullable<Algorithm>;
    label: string;
    icon: React.ElementType;
}