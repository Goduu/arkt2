"use client";
import { useMounted } from "@/app/useMounted";
import { useTheme } from "next-themes";

interface DotProps {
    /**
     * Color of the dot
     */
    color?: string;

    /**
     * Size of the dot in pixels
     */
    size?: number;

    /**
     * Spacing between dots
     */
    spacing?: number;

    /**
     * Content of the component
     */
    children?: React.ReactNode;

    /**
     * Class name
     */
    className?: string;

    style?: React.CSSProperties;
}

export default function Dot({
    size = 1,
    spacing = 20,
    children,
    className,
}: DotProps) {
    const { resolvedTheme } = useTheme();
    const mounted = useMounted();

    const color = mounted && resolvedTheme === "light" ? "#cacaca" : "#1e293b";
    return (
        <div
            style={{
                backgroundImage: `radial-gradient(${color} ${size}px, transparent ${size}px)`,
                backgroundSize: `calc(${spacing} * ${size}px) calc(${spacing} * ${size}px)`,
            }}
            className={className}
        >
            {children}
        </div>
    );
}
