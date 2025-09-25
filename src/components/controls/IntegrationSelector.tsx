import { Button } from "@/components/ui/button";
import { Figma, Github } from "lucide-react";

type IntegrationSelectorProps = {
    selectedIntegration: Integration;
    onChange: (integration: Integration) => void;
}

export function IntegrationSelector({ selectedIntegration, onChange }: IntegrationSelectorProps) {
    return (
        <div>
            <label className="block text-xs text-muted-foreground mb-1">Integration</label>
            {INTEGRATIONS.map((fs) => (
                <Button
                    key={fs.value}
                    aria-label={`integration-${fs.value}`}
                    variant={selectedIntegration === fs.value ? "default" : "ghost"}
                    className="size-9 shrink-0"
                    fillColor={{ family: "slate", indicative: "low" }}
                    size="icon"
                    onClick={() => {
                        onChange(fs.value as Integration);
                    }}
                >
                    <fs.icon className="size-4" />
                </Button>
            ))}
        </div>
    );
}

export type Integration = "github" | "figma";

const INTEGRATIONS = [
    { value: "github", icon: Github, },
    { value: "figma", icon: Figma, },
]