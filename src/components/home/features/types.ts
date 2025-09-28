import { TailwindFamily } from "@/components/colors/types";

export type Feature = {
    id: string;
    tag: string;
    headline: string;
    description: string;
    text: TextItem[];
    cta?: { label: string; href: string };
    icon: string;
    iconBgColor: TailwindFamily;
};

type TextItem = {
    type: "string";
    value: string;
} 