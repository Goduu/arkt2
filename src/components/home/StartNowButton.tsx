import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type StartNowButtonProps = {
    className?: string;
    "aria-label"?: string;
    href?: string;
    size?: "xs" | "sm" | "md" | "lg";
}
export function StartNowButton({ className, "aria-label": ariaLabel, href = "/design", size = "md" }: StartNowButtonProps) {
    return (
        <Link href={href}>
            <Button
                aria-label={`Start now ${ariaLabel}`}
                fillColor={{ family: "lime", indicative: "low" }}
                className={cn("z-10", className, size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg")}
            >
                Start now
            </Button>
        </Link>
    )
}