import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "./FlowEditor";
import { ModeToggle } from "../../components/ModeToggle";


export default function EditableEdgeFlow() {
    return (
        <ReactFlowProvider>
            <div className="relative min-h-screen flex flex-col">
                <FlowEditor />
            </div>
        </ReactFlowProvider>
    );
}