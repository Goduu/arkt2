import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "./FlowEditor";
import { Dialogs } from "@/components/Dialogs";

export default function EditableEdgeFlow() {
    return (
        <ReactFlowProvider>
            <div className="relative min-h-screen flex flex-col">
                <FlowEditor />
                <Dialogs />
            </div>
        </ReactFlowProvider>
    );
}