import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "./FlowEditor";
import { Dialogs } from "@/components/Dialogs";
import { TopBar } from "./topbar/TopBar";

export default function EditableEdgeFlow() {
    return (
        <ReactFlowProvider>
            <div className="relative min-h-screen flex flex-col">
                <TopBar />
                <FlowEditor />
                <Dialogs />
            </div>
        </ReactFlowProvider>
    );
}