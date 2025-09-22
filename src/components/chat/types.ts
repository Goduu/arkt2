import { ToolEvent, UsageInfo } from "@/lib/ai/aiTypes";

export type ChatTag = "Ask" | "Create";

// AI Chat persistence
export type AIMessageRole = 'user' | 'assistant';

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  tag: ChatTag;
  content: string;
  createdAt: number;
  usage?: UsageInfo | null;
  model?: string | null;
  tools?: ToolEvent[];
}

export interface AIChat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: AIMessage[];
}
