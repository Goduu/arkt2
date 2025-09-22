import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type StrokeTypeSelectorProps = {
    selectedWidth: number;
    onChange: (width: number) => void;
}

export function StrokeWidth({ selectedWidth, onChange }: StrokeTypeSelectorProps) {
    return (
        <div data-testid="edge-stroke-width-group">
            <label className="block text-xs text-muted-foreground mb-1">Stroke width</label>
            <ToggleGroup
                variant="outline"
                type="single"
                value={selectedWidth.toString()}
                onValueChange={(value:string) => {
                    if (!value) return;
                    onChange(Number(value));
                }}
            >
                <ToggleGroupItem value="2" aria-label="2">
                    <div className="w-3 h-0.5 bg-current rounded-xl"/>
                </ToggleGroupItem>
                <ToggleGroupItem value="3" aria-label="3">
                    <div className="w-3 h-1 bg-current rounded-xl"/>
                </ToggleGroupItem>
                <ToggleGroupItem value="4" aria-label="4">
                    <div className="w-3 h-1.5 bg-current rounded-xl"/>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}