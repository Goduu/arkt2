import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { systemPrompt } from "@/lib/ai/prompts";
import { buildGithubFetchTool } from "@/lib/ai/tools/fetchGithubTool";
import { mapStreamPartToMetadata } from "@/lib/ai/metadata";
import { OpenAIProvider } from "@ai-sdk/openai";
import { ArktUIMessage } from "@/lib/ai/aiTypes";

const MODEL = "gpt-4o";

export function handleAsk(uiMessages: ArktUIMessage[],
    contextJson: string,
    provider: OpenAIProvider,
    githubToken?: string,
): Response {
    // Stream text with tools
    const tools = buildGithubFetchTool(githubToken);
    const modelMessages = uiMessages
        ? convertToModelMessages(uiMessages)
        : [];
    modelMessages.push({
        role: "user" as const,
        content: [
            { type: "text" as const, text: `Context (diagrams, rootId, mentions, tag):\n${contextJson}` },
        ],
    });

    const result = streamText({
        model: provider(MODEL),
        system: systemPrompt,
        messages: modelMessages,
        stopWhen: stepCountIs(5),
        tools,
        toolChoice: "auto",
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