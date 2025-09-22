"use client";

import ChatHistoryDialog from "./chatHistory/ChatHistoryDialog";
import { ChatHistoryPopover } from "./ChatPopover";


export function ActionBar() {
    return (
        <div className="pb-2 flex items-center gap-2 px-2 bg-background rounded-xs shadow-xs border-gray-200 justify-end">
            <ChatHistoryDialog />
            <ChatHistoryPopover />
        </div>
    );
}

ActionBar.displayName = "ActionBar";


