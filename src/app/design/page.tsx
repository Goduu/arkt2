import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "./FlowEditor";
import { Dialogs } from "@/components/Dialogs";
import { TopBar } from "./top-bar/TopBar";
import { Suspense } from "react";

export default function EditableEdgeFlow() {
    return (
        <ReactFlowProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <div className="relative h-screen flex flex-col" data-testid="design-page">
                    <TopBar />
                    <FlowEditor />
                    <Dialogs />
                </div>
            </Suspense>
        </ReactFlowProvider>
    );
}