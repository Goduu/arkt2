import SketchyShape from "@/components/sketchy/SketchyShape";
import { TailwindFamily } from "@/components/colors/types";
import { getIconByKey } from "@/lib/icons/iconRegistry";
import { cn } from "@/lib/utils";
import { getTailwindTextClass } from "@/components/colors/utils";
import { useMounted } from "@/app/useMounted";

type FeatureIconProps = {
    icon: string;
    className?: string;
    iconBgColor: TailwindFamily;
    iconSize?: 24 | 48 | 96;
}
export const FeatureIcon = ({ icon, className, iconBgColor, iconSize = 24 }: FeatureIconProps) => {
    const iconDefinition = getIconByKey(icon);
    const Icon = iconDefinition?.Icon;
    const mounted = useMounted();
    if (!Icon || !mounted) return null;

    const getSketchClass = (size: number) => {
        switch (size) {
            case 24: return "size-12";
            case 48: return "size-24";
            case 96: return "size-48";
        }
    }

    return (
        <div className="relative">
            <SketchyShape
                kind="rectangle"
                fillStyle="zigzag"
                fillWeight={1}
                fillColor={{ family: iconBgColor, indicative: "low" }}
                strokeWidth={0}
                className={getSketchClass(iconSize)}
                width={20}
                height={10}
            />
            <Icon size={iconSize} name={icon}
                className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    getTailwindTextClass({ family: iconBgColor, indicative: "high" }),
                    className)}
            />
        </div>
    )
};