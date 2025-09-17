import { Button } from "@/components/ui/button";
import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, FileSymlink, Github } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ArktNode, ArktNodeData } from "@/components/nodes/arkt/types";
import { TAILWIND_FILL_COLORS } from "@/components/colors/utils";
import { ColorSelector } from "../ColorSelector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import GithubFileDialog from "./GithubFileDialog";
import { FontSizeSelector } from "../FontSizeSelector";

type BasicNodeControlProps = {
    node: ArktNode;
    onChange: (partial?: Partial<ArktNodeData>) => void;
};

export const BasicNodeControl: FC<BasicNodeControlProps> = ({
    node,
    onChange,
}) => {
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const { description, githubLink, fillColor, strokeColor, fontSize, templateId } = node.data ?? {};

    return (
        <>
            <div>
                <div className="flex items-center justify-between">
                    <label className="block text-xs text-muted-foreground mb-1">GitHub file link</label>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground cursor-help">what&apos;s this?</span>
                        </TooltipTrigger>
                        <TooltipContent>Paste a GitHub file URL. We&apos;ll show a pretty preview.</TooltipContent>
                    </Tooltip>
                </div>
                <div className="relative flex items-center gap-2">
                    <Github className="absolute left-2 top-[19px] -translate-y-1/2 size-4 text-muted-foreground/70" />
                    <Input
                        placeholder="https://github.com/owner/repo/blob/main/path/file.tsx"
                        className="pl-8 transition-all"
                        value={githubLink}
                        onChange={(e) => onChange({ githubLink: e.target.value })}
                    />
                    {githubLink && (
                        <>
                            <Button
                                title="Preview file"
                                size="icon"
                                variant="outline"
                                onClick={() => setPreviewOpen(true)}
                                className="shrink-0">
                                <Eye className="size-4" />
                            </Button>
                            <Button
                                title="Go to file"
                                size="icon"
                                variant="outline"
                                onClick={() => githubLink && window.open(githubLink, "_blank")}
                                className="shrink-0">
                                <FileSymlink className="size-4" />
                            </Button>
                        </>
                    )}
                </div>

                <GithubFileDialog open={previewOpen} onOpenChange={setPreviewOpen} url={githubLink} />
            </div>
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
            {/* <TemplateCombobox
                templateId={templateId}
                commit={onChange}
            /> */}
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
        </>
    );
};