import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "./FlowEditor";
import { Dialogs } from "@/components/Dialogs";
import { TopBar } from "./top-bar/TopBar";
import { Suspense } from "react";

export default function EditableEdgeFlow() {
    return (
        <ReactFlowProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <div className="relative min-h-screen flex flex-col">
                    <TopBar />
                    <FlowEditor />
                    <Dialogs />
                </div>
            </Suspense>
        </ReactFlowProvider>
    );
}