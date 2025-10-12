import { ReactFlowProvider } from "@xyflow/react";
import { Dialogs } from "@/components/Dialogs";
import { TopBar } from "./top-bar/TopBar";
import { Suspense } from "react";
import MobileDock from "./MobileDock";
import { FlowEditorWithProvider } from "./FlowEditorWithProvider";

export default function EditableEdgeFlow() {

    return (
        <ReactFlowProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <div className="relative h-screen flex flex-col" data-testid="design-page">
                    <TopBar />
                    <FlowEditorWithProvider />
                    <Dialogs />
                    <MobileDock />
                </div>
            </Suspense>
        </ReactFlowProvider>
    );
}