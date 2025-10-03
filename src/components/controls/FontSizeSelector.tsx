import { Button } from "@/components/ui/button";

type FontSizeSelectorProps = {
    selectedFontSize: number;
    onChange: (fontSize: number) => void;
}

export function FontSizeSelector({ selectedFontSize, onChange }: FontSizeSelectorProps) {
    return (
        <div data-testid="font-size-selector">
            <label className="block text-xs text-muted-foreground mb-1">Font Size</label>
            {FONT_SIZES.map((fs) => (
                <Button
                    key={fs.label}
                    aria-label={`font-size-${fs.size}`}
                    variant={selectedFontSize === fs.size ? "default" : "ghost"}
                    className="size-9 shrink-0"
                    fillColor={{ family: "slate", indicative: "low" }}
                    size="icon"
                    onClick={() => {
                        onChange(fs.size);
                    }}
                >
                    {fs.label}
                </Button>
            ))}
        </div>
    );
}

export const FONT_SIZES = [
    { size: 10, label: "S", },
    { size: 12, label: "M", },
    { size: 15, label: "L", },
    { size: 20, label: "XL", },
]