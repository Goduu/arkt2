import { ReactNode } from "react";

export type DockItemData = {
    icon: ReactNode;
    label: ReactNode;
    onClick?: () => void;
    className?: string;
    subItems?: DockItemData[];
};