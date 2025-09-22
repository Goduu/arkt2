import { openai, createOpenAI } from "@ai-sdk/openai";
import type { MyUIMessage } from "@/lib/aiTypes";
import { decryptOpenAIKey, type EncryptedKeyBlob } from "@/lib/server/crypto";
import type { DiagramLite } from "@/lib/ai/context";
import { handleCreate } from "./handleCreate";
import { handleAsk } from "./handleAsk";
import { extractGithubToken } from "@/lib/http/cookies";
import { MinimalTemplate } from "@/components/chat/prepareRequestData";

export async function POST(req: Request): Promise<Response> {
    try {
        // Parse and validate request body
        const body = await req.json();
        const userPrompt = typeof body?.prompt === 'string' ? String(body?.prompt ?? "").trim() : "";

        const diagrams: Record<string, DiagramLite> | undefined = body?.diagrams ?? body?.data?.diagrams;
        const rootId: string | undefined = body?.rootId ?? body?.data?.rootId;
        const mentions: Array<{ id: string; label: string }> | undefined = body?.mentions ?? body?.data?.mentions;
        const encKey: EncryptedKeyBlob | undefined = body?.encryptedKey ?? body?.data?.encryptedKey;
        const tag: string | undefined = body?.tag ?? body?.data?.tag;
        const templates: Array<MinimalTemplate> | undefined = body?.templates ?? body?.data?.templates;
        // Build system prompt (imported)

        // Prepare context
        const contextJson = JSON.stringify({
            diagrams: diagrams ?? {},
            currentDiagramId: rootId ?? null,
            mentionsInUserPrompt: mentions ?? [],
            availableTemplates: templates ?? [],
        });

        // Build provider: use decrypted key if provided, else fallback to env
        let provider = openai;

        if (encKey) {
            const decryptedKey = await decryptOpenAIKey(encKey);
            if (decryptedKey) {
                provider = createOpenAI({ apiKey: decryptedKey });
            }
        }

        // Decide input mode: AI SDK UI messages or custom single prompt with context
        const uiMessages: MyUIMessage[] = Array.isArray(body?.messages) ? body.messages : [];
        // Build messages for the model
        if (tag === "Create") {
            return handleCreate(uiMessages, userPrompt, contextJson, provider);
        }
        const githubToken = extractGithubToken(req);

        return handleAsk(uiMessages, userPrompt, contextJson, provider, githubToken);


    } catch (error) {
        console.error("[/ai-create/route.ts] Failed to process AI request:", error);
        return new Response("Failed to process AI request.", { status: 500 });
    }
}