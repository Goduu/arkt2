import { UIMessage } from "ai";
import { z } from "zod";

// Shared message metadata schema for AI SDK UI messages
export const messageMetadataSchema = z.object({
  createdAt: z.number().optional(),
  model: z.string().optional(),
  usage: z.object({
    totalTokens: z.number().optional(),
    inputTokens: z.number().optional(),
    outputTokens: z.number().optional(),
  }).optional(),
  tools: z.array(z.object({
    name: z.string(),
    atMs: z.number(),
    callId: z.string().optional(),
    input: z.unknown().optional(),
    output: z.unknown().optional(),
    error: z.unknown().optional(),
    preliminary: z.boolean().optional(),
  })).optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
export type ArktUIMessage = UIMessage<MessageMetadata>;

// Aligned with MessageMetadata["usage"] and AI SDK v5 usage shape
export type UsageInfo = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
};

// Shared usage and tool event types persisted with assistant messages
export type ToolEvent = {
  name: string;
  args?: unknown;
  result?: unknown;
  error?: string;
  atMs: number;
};


