export type ToolEventRecord = {
  name: string;
  args?: unknown;
  result?: unknown;
  error?: string;
  atMs: number;
};

export type UsageRecord = {
  promptTokens?: number;
  completionTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type AIInteractionMetrics = {
  id: string; // assistant message id
  chatId: string;
  createdAt: number;
  model?: string | null;
  usage?: UsageRecord | null;
  toolEvents?: ToolEventRecord[];
  durationMs?: number | null;
};

const STORAGE_KEY = "arkt-usage-history";
const MAX_RECORDS = 500;

export function saveInteractionMetrics(record: AIInteractionMetrics): void {
  try {
    // Normalize usage property to the new shape in case callers send legacy fields
    const normalized: AIInteractionMetrics = {
      ...record,
      usage: normalizeUsageRecord(record.usage ?? undefined) ?? null,
    };
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: AIInteractionMetrics[] = raw ? JSON.parse(raw) : [];
    const next = [normalized, ...list].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    console.error("Error saving interaction metrics:", record);
  }
}

export function listInteractionMetrics(chatId?: string): AIInteractionMetrics[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: AIInteractionMetrics[] = JSON.parse(raw);
    const mapped = list.map((r) => ({ ...r, usage: normalizeUsageRecord(r.usage ?? undefined) ?? null }));
    return chatId ? mapped.filter((r) => r.chatId === chatId) : mapped;
  } catch {
    console.error("Error listing interaction metrics:", chatId);
    return [];
  }
}

export function clearInteractionMetrics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error("Error clearing interaction metrics");
  }
}

// Helpers
function normalizeUsageRecord(u?: UsageRecord | (Partial<UsageRecord> & { promptTokens?: number; completionTokens?: number; })): UsageRecord | undefined {
  if (!u) return undefined;
  const hasLegacy = typeof u.promptTokens === 'number' || typeof u.completionTokens === 'number';
  if (!hasLegacy) {
    // Already in new shape
    return {
      inputTokens: u.inputTokens,
      outputTokens: u.outputTokens,
      totalTokens: u.totalTokens,
    };
  }
  const inputTokens = u.promptTokens;
  const outputTokens = u.completionTokens;
  const totalTokens = typeof u.totalTokens === 'number'
    ? u.totalTokens
    : sumIfNumbers(inputTokens, outputTokens);
  return { inputTokens, outputTokens, totalTokens };
}

function sumIfNumbers(a?: number, b?: number): number | undefined {
  const aValid = typeof a === 'number' ? a : undefined;
  const bValid = typeof b === 'number' ? b : undefined;
  if (typeof aValid === 'number' && typeof bValid === 'number') return aValid + bValid;
  if (typeof aValid === 'number') return aValid;
  if (typeof bValid === 'number') return bValid;
  return undefined;
}


