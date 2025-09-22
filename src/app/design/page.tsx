import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "./FlowEditor";
import { Dialogs } from "@/components/Dialogs";
import { ChatBubble } from "@/components/chat/ChatBubble";

export default function EditableEdgeFlow() {
    return (
        <ReactFlowProvider>
            <div className="relative min-h-screen flex flex-col">
                <FlowEditor />
                <Dialogs />
                <ChatBubble />
            </div>
        </ReactFlowProvider>
    );
}