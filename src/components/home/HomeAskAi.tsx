"use client";
import { useEffect, useRef } from "react";
import { MentionsInput } from "../chat/chatHistory/MentionsInput"

export const HomeAskAi = () => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const editor = ref.current;
        if (!editor) return;

        const m1 = mentionOptions[0];
        const m2 = mentionOptions[1];
        const m3 = mentionOptions[7];
        if (!m1 || !m2 || !m3) return;

        const createMentionSpan = (m: { id: string; label: string }) => {
            const span = document.createElement("span");
            span.className = "mention";
            span.setAttribute("data-id", m.id);
            span.setAttribute("data-label", m.label);
            span.style.backgroundColor = "#e3f2fd";
            span.style.color = "#1976d2";
            span.style.padding = "2px 4px";
            span.style.borderRadius = "3px";
            span.style.marginRight = "2px";
            span.contentEditable = "false";
            span.textContent = `@${m.label}`;
            return span;
        };

        editor.innerHTML = "";
        editor.appendChild(document.createTextNode("What if I decide to migrate the "));
        editor.appendChild(createMentionSpan(m1));
        editor.appendChild(document.createTextNode(" and "));
        editor.appendChild(createMentionSpan(m2));
        editor.appendChild(document.createTextNode(" to another service? "));
        editor.appendChild(document.createTextNode(" Do I need to make any adjustments to my "));
        editor.appendChild(createMentionSpan(m3));
        editor.appendChild(document.createTextNode(" integration? "));

        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }, [ref]);
    return (
        <div className="h-44 p-2">
            <MentionsInput mentions={mentionOptions} ref={ref} className="text-lg"/>
        </div>
    )
}


const mentionOptions = [
    { id: "1", label: "Home Page" },
    { id: "2", label: "About Page" },
    { id: "3", label: "Contact Page" },
    { id: "4", label: "Blog Page" },
    { id: "5", label: "Products Page" },
    { id: "6", label: "Services Page" },
    { id: "7", label: "Pricing Page" },
    { id: "8", label: "Database" },
    { id: "9", label: "Register" },
]