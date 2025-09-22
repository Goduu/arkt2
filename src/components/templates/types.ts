import { IconKey } from "@/lib/icons/iconRegistry";
import { Color } from "../colors/types";

export type TemplateData = {
    id: string;
    name: string;
    description?: string;
    iconKey?: IconKey;
    strokeColor: Color;
    fillColor: Color;
    updatedAt: number;
    lastUsedAt?: number;
}