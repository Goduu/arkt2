import { FC } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArktNode, ArktNodeData } from "@/components/nodes/arkt/types";
import { TAILWIND_FILL_COLORS } from "@/components/colors/utils";
import { ColorSelector } from "../ColorSelector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FontSizeSelector } from "../FontSizeSelector";
import { useMetaKeyLabel } from "@/hooks/use-meta-key";
import { TemplateCombobox } from "@/components/templates/TemplateCombobox";

type BasicNodeControlProps = {
    node: ArktNode;
    onChange: (partial?: Partial<ArktNodeData>) => void;
};

export const BasicNodeControl: FC<BasicNodeControlProps> = ({
    node,
    onChange,
}) => {
    const { description, fillColor, strokeColor, fontSize, templateId } = node.data ?? {};
    const metaKey = useMetaKeyLabel();
    
    return (
        <>
            <div data-testid="basic-controls-description">
                <label className="block text-xs text-muted-foreground mb-1">Description</label>
                <Textarea
                    className="w-full px-2 py-1 bg-transparent resize-none"
                    rows={3}
                    value={description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    data-testid="basic-controls-description-input"
                />
            </div>
            <div>
                <FontSizeSelector
                    selectedFontSize={fontSize}
                    onChange={(v) => onChange({ fontSize: v })}
                />
            </div>
            <TemplateCombobox
                templateId={templateId}
                commit={onChange}
            />
            <div data-testid="basic-controls-fill-color">
                <ColorSelector
                    disabled={!!templateId}
                    label="Fill color"
                    defaultOptions={TAILWIND_FILL_COLORS}
                    value={fillColor}
                    indicative={"low"}
                    onChange={(next) => {
                        onChange({ fillColor: next });
                    }}
                />
            </div>
            <div data-testid="basic-controls-stroke-color">
                <ColorSelector
                    disabled={!!templateId}
                    label="Stroke color"
                    value={strokeColor}
                    indicative={"high"}
                    onChange={(next) => { onChange({ strokeColor: next }); }}
                />
            </div>
            <div className="text-[10px] whitespace-nowrap text-muted-foreground opacity-70 select-none">
                {`${metaKey}+click to navigate`}
            </div>
        </>
    );
};