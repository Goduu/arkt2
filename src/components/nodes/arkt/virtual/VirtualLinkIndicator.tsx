import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SketchyShape from "@/components/sketchy/SketchyShape";
import { Button } from "@/components/ui/button";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import useUserDataStateSynced from "@/components/yjs/useUserStateSynced";
import useNodeVirtualConnections from "@/components/yjs/useNodeVirtualConnections";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from "@/components/colors/utils";
import { getNodePathLabelsFromNode } from "@/components/yjs/nodePathUtils";
import { useReactFlow } from "@xyflow/react";

type VirtualLinkIndicatorProps = {
    nodeId: string;
}

export function VirtualLinkIndicator({ nodeId }: VirtualLinkIndicatorProps) {
    const virtualLinksToThisNode = useNodeVirtualConnections(nodeId);
    const { fitView } = useReactFlow();
    const { onDiagramDrillToNode } = useUserDataStateSynced(fitView);
    const [open, setOpen] = useState(false);

    if (virtualLinksToThisNode.length === 0) return null;

    return (
        <div className={cn("absolute -top-2 -right-2 z-30")}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild onClick={(e) => { e.stopPropagation(); }}>
                    <div className="relative">
                        <div
                            role="button"
                            className="relative flex items-center justify-center cursor-pointer z-30 p-0 size-5 gap-0.5 text-[6px]"
                            title="Virtual links"
                        >
                            <LinkIcon className="size-2" />
                            {/* {lengthTruncated} */}
                        </div>
                        <SketchyShape
                            className="absolute p-0 inset-0 pointer-events-none z-0 rounded-full backdrop-blur"
                            width={40}
                            height={36}
                            kind="ellipse"
                            fillColor={DEFAULT_FILL_COLOR}
                            strokeColor={DEFAULT_STROKE_COLOR}
                            strokeWidth={1.8}
                            fillStyle="zigzag"
                            roughness={1.2}
                            seed={7}
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={0} className="w-[260px] p-0 text-xs rounded-xs">
                    <SketchyPanel>
                        <div className="px-2 py-1 border-b text-[11px] font-medium">Linked via virtual nodes</div>
                        <ul className="max-h-60 overflow-auto">
                            {virtualLinksToThisNode.map((node, idx) => {
                                const ancestors = getNodePathLabelsFromNode(node).slice(0, -1);

                                return (
                                    <li key={`${node.data.pathId}:${idx}`} className="px-2 py-2 border-b last:border-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="truncate">
                                                <div className="text-muted-foreground truncate">{node.data.label}</div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="shrink-0 hover:bg-muted"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDiagramDrillToNode(node.data.pathId);
                                                    setOpen(false);
                                                }}
                                            >
                                                Open
                                            </Button>
                                        </div>
                                        <div className="mt-1 text-[10px] text-muted-foreground">{ancestors.join(" › ")}</div>
                                    </li>
                                )
                            })}
                        </ul>
                    </SketchyPanel>
                </PopoverContent>
            </Popover>
        </div>
    )
}