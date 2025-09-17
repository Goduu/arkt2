import { getIconByKey, IconKey } from "@/lib/icons/iconRegistry";
import { Color } from "../colors/types";
import { getTailwindTextClass } from "../colors/utils";
import SketchyShape from "../sketchy/SketchyShape";
import { cn } from "../utils";

type TemplateIconProps = {
    iconKey?: IconKey,
    strokeColor?: Color;
    fillColor?: Color;
    className?: string
}

export const TemplateIcon = ({
    iconKey,
    strokeColor,
    fillColor,
    className = "size-6"
}: TemplateIconProps) => {
    const iconDefinition = getIconByKey(iconKey);
    const Icon = iconDefinition?.Icon;

    const iconColorClass = getTailwindTextClass(strokeColor);
    const seed = (iconKey?.length ?? 0) + (strokeColor?.family.length ?? 7);


    return (
        <div
            className={cn(
                "relative inline-block align-middle shrink-0 p-1 backdrop-blur-md",
                className
            )}
        >
            {/* Background shape fills the container and is drawn to the measured size */}
            <SketchyShape
                className="absolute p-0 inset-0 z-0 h-full w-full pointer-events-none"
                kind="rectangle"
                fillColor={fillColor}
                strokeColor={strokeColor}
                strokeWidth={7}
                roughness={4}
                seed={seed}
                hachureGap={10}
            />

            {/* Centered icon */}
            <div className="relative inset-0 z-10 flex items-center justify-center">
                {Icon && <Icon className={cn("h-4 w-4", iconColorClass)} aria-label={iconDefinition?.label} />}
            </div>
            {/* Fallback intrinsic size so the wrapper has dimensions when no size classes are passed */}
            <span className="block h-4 w-4 opacity-0 select-none pointer-events-none" aria-hidden="true" />

        </div>
    )
}