import { ArktUIMessage } from "@/lib/ai/aiTypes";
import { mapStreamPartToMetadata } from "@/lib/ai/metadata";
import { createDiagramSystemPrompt } from "@/lib/ai/prompts";
import { CreateDiagramOutputSchema } from "@/lib/ai/tools/createDiagramTool";
import { OpenAIProvider } from "@ai-sdk/openai";
import { convertToModelMessages, Output, streamText } from "ai";

const MODEL = "gpt-4o";
export function handleCreate(
    uiMessages: ArktUIMessage[],
    userPrompt: string,
    contextJson: string,
    provider: OpenAIProvider
): Response {
    const currentMessages = uiMessages && convertToModelMessages(uiMessages) || []

    const modelMessages = [
        ...currentMessages,
        {
            role: "user" as const,
            content: [
                { type: "text" as const, text: `User question:\n${userPrompt || "(empty)"}` },
                { type: "text" as const, text: `Context JSON (diagrams, rootId, mentions, availableTemplates):\n${contextJson}` },
            ],
        },
    ];

    // Stream text with tools
    const result = streamText({
        model: provider(MODEL),
        system: createDiagramSystemPrompt,
        messages: modelMessages,
        experimental_output: Output.object({
            schema: CreateDiagramOutputSchema
        }),
        temperature: 0.2, // Add some consistency to responses
    });



    // Use the built-in UI message stream response for tool calls and metadata
    return result.toUIMessageStreamResponse({
        originalMessages: uiMessages ?? undefined,
        messageMetadata: ({ part }) => {
            return mapStreamPartToMetadata(part, MODEL);
        },
        headers: {
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
        onError: (error) => {
            console.error("AI stream error:", error);
            return "An error occurred during AI processing.";
        }
    });
}