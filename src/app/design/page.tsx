import { ReactFlowProvider } from "@xyflow/react";
import { Dialogs } from "@/components/Dialogs";
import { TopBar } from "./top-bar/TopBar";
import { Suspense } from "react";
import MobileDock from "./MobileDock";
import { FlowEditorWithProvider } from "./FlowEditorWithProvider";
import { ChatSheet } from "@/components/chat/ChatSheet";
import LoadingPage from "./LoadingPage";

export default function EditableEdgeFlow() {

    return (
        <ReactFlowProvider>
            <Suspense fallback={<LoadingPage />}>
                <div className="relative h-screen flex flex-col" data-testid="design-page">
                    <TopBar />
                    <FlowEditorWithProvider />
                    <Dialogs />
                    <MobileDock />
                    <ChatSheet />
                </div>
            </Suspense>
        </ReactFlowProvider>
    );
}