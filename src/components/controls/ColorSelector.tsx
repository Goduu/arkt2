import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useState } from "react";
import { getTailwindBgClass, SUPPORTED_TAILWIND_FAMILIES, TAILWIND_STROKE_COLORS } from "../colors/utils";
import { TailwindFamily, TailwindIndicative } from "../colors/types";
import { Color } from "../colors/types";

type ColorSelectorProps = {
    label?: string;
    onChange: (color: Color) => void;
    value?: Color;
    defaultOptions?: TailwindFamily[];
    indicative?: TailwindIndicative;
    disabled?: boolean;
}

export function ColorSelector({ label, onChange, value, defaultOptions = TAILWIND_STROKE_COLORS, indicative = "high", disabled = false }: ColorSelectorProps) {
    const [selectedColor, setSelectedColor] = useState(value?.family);
    const allColors = SUPPORTED_TAILWIND_FAMILIES;

    const handleColorClick = (color: TailwindFamily) => {
        setSelectedColor(color);
    };

    return (
        <div>
            <label className="block text-xs text-muted-foreground mb-1">{label ?? "Color"}</label>

            <div className="flex items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button disabled={disabled} variant="ghost" size="icon" className="size-10" fillColor={{ family: selectedColor as TailwindFamily, indicative }}>
                            <div className={`size-6 rounded-full border border-slate-200 ${selectedColor && getTailwindBgClass({ family: selectedColor, indicative })}`} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="flex flex-wrap gap-2 w-full items-center justify-center">
                            {allColors.map((color) => (
                                <Button
                                    key={color}
                                    variant="ghost"
                                    className="size-10"
                                    size="icon"
                                    onClick={() => {
                                        onChange({ family: color as TailwindFamily, indicative });
                                        handleColorClick(color);
                                    }}
                                    fillColor={{ family: color as TailwindFamily, indicative }}
                                >
                                    <div
                                        className={cn(
                                            `size-6 rounded-full border border-slate-200`,
                                            getTailwindBgClass({ family: color as TailwindFamily, indicative })
                                        )}
                                    />
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
                <div className="w-1 h-5 border-r border-slate-200"></div>
                {defaultOptions.map((color) => (
                    <Button
                        disabled={disabled}
                        key={color}
                        variant="ghost"
                        className="size-10 shrink-0"
                        aria-label={color}
                        size="icon"
                        onClick={() => {
                            onChange({ family: color, indicative });
                            handleColorClick(color);
                        }}
                        fillColor={{ family: color, indicative }}
                    >
                        <div
                            className={cn(
                                `size-6 rounded-full border border-slate-200`,
                                getTailwindBgClass({ family: color, indicative })
                            )}
                        />
                    </Button>
                ))}
            </div>


        </div>
    );
}