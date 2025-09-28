import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { NodeUnion } from "@/components/nodes/types"
import ydoc from "@/components/yjs/ydoc"
import { ArktEdge } from "@/components/edges/ArktEdge/type"
import { TemplateData } from "@/components/templates/types"
import { useState } from "react"

export const nodesMap = ydoc.getMap<NodeUnion>('nodes');
export const edgesMap = ydoc.getMap<ArktEdge>('edges');
export const templatesMap = ydoc.getMap<TemplateData>('templates');

export function ResetDialog() {

    const [open, setOpen] = useState(false);

    const handleReset = () => {
        for (const key of Array.from(nodesMap.keys())) nodesMap.delete(key);
        for (const key of Array.from(edgesMap.keys())) edgesMap.delete(key);
        for (const key of Array.from(templatesMap.keys())) templatesMap.delete(key);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger title="Reset">
                <RefreshCcw className="size-5 ml-1" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reset</DialogTitle>
                    <DialogDescription>
                        Reset everything to the initial state? This will delete all nodes, edges and templates.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="destructive" onClick={handleReset}>Reset</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}