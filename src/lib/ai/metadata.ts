import type { MessageMetadata } from "@/lib/ai/aiTypes";
import { TextStreamPart, ToolSet } from "ai";

export function mapStreamPartToMetadata(part: TextStreamPart<ToolSet>, model: string): MessageMetadata | undefined {
    if (part.type === 'tool-call') {
        return {
            tools: [{
                name: part.toolName,
                atMs: Date.now(),
                callId: part.toolCallId,
                input: part.input,
            }]
        };
    }
    if (part.type === 'tool-result') {
        return {
            tools: [{
                name: part.toolName,
                atMs: Date.now(),
                callId: part.toolCallId,
                input: part.input,
                output: part.output,
                preliminary: part.preliminary,
            }]
        };
    }
    if (part.type === 'tool-error') {
        return {
            tools: [{
                name: part.toolName,
                atMs: Date.now(),
                callId: part.toolCallId,
                input: part.input,
                error: part.error,
            }]
        };
    }
    // AI SDK v5 emits 'response-start' and 'response-finish' parts
    if (part.type === 'start') {
        return {
            createdAt: Date.now(),
            model: model,
        };
    }
    if (part.type === 'finish') {
        const totalUsage = part.totalUsage;
        return {
            usage: {
                totalTokens: totalUsage.totalTokens,
                inputTokens: totalUsage.inputTokens,
                outputTokens: totalUsage.outputTokens
            }
        };
    }
    return undefined;
}


