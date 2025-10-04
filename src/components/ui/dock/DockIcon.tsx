import { MotionValue } from "motion/react";
import { ReactNode } from "react";

type DockIconProps = {
    className?: string;
    children: ReactNode;
    isHovered?: MotionValue<number>;
};

export function DockIcon({ children, className = '' }: DockIconProps) {
    return <div className={`flex items-center justify-center ${className}`}>{children}</div>;
}