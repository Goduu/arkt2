import { ChangeEvent, FC } from "react";
import { Input } from "@/components/ui/input";
import { IntegrationNode } from "@/components/nodes/arkt/integrations/type";
import { IntegrationSelector } from "../IntegrationSelector";
import { useIntegrationNodeControls } from "@/components/nodes/arkt/integrations/useTextNodeControls";
import { useMetaKeyLabel } from "@/hooks/use-meta-key";

type IntegrationsControlProps = {
    node: IntegrationNode;
};

export const IntegrationsControl: FC<IntegrationsControlProps> = ({
    node,
}) => {
    const { type, url, description } = node.data;
    const { onNodeUpdate } = useIntegrationNodeControls(node.id);
    const metaKey = useMetaKeyLabel();

    return (
        <div data-testid="text-controls">
            <div className="flex gap-4 flex-col">
                <div data-testid="text-fontsize-group">
                    <IntegrationSelector
                        selectedIntegration={type}
                        onChange={(v) => onNodeUpdate({ type: v })}
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">URL</label>
                    <Input
                        className="w-full px-2 bg-transparent"
                        value={url}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onNodeUpdate({ url: e.target.value })}
                        data-testid="text-controls-label"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Description</label>
                    <Input
                        className="w-full px-2 bg-transparent"
                        value={description}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onNodeUpdate({ description: e.target.value })}
                        data-testid="text-controls-label"
                    />
                </div>
                <div className="text-[10px] whitespace-nowrap text-muted-foreground opacity-70 select-none">
                    {`${metaKey}+click to open`}
                </div>
            </div>
        </div>
    );
};