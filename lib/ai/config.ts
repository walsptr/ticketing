export type AiProviderName = "openai-compatible" | "ollama";

export type AiRuntimeConfig = {
  provider: AiProviderName;
  baseUrl: string;
  apiKey: string;
  model: string;
  systemEmail: string;
  systemName: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
};

function parseNumber(input: string | undefined, fallback: number): number {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getAiRuntimeConfig(): AiRuntimeConfig | null {
  const providerRaw = (process.env.AI_PROVIDER ?? "").trim().toLowerCase();
  const baseUrl = (process.env.AI_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const model = (process.env.AI_MODEL ?? "").trim();

  if (!providerRaw || !baseUrl || !model) {
    return null;
  }

  if (providerRaw !== "openai-compatible" && providerRaw !== "ollama") {
    return null;
  }

  return {
    provider: providerRaw,
    baseUrl,
    apiKey: (process.env.AI_API_KEY ?? "").trim(),
    model,
    systemEmail: (process.env.AI_SYSTEM_EMAIL ?? "ai-support@local").trim(),
    systemName: (process.env.AI_SYSTEM_NAME ?? "AI Support").trim(),
    temperature: parseNumber(process.env.AI_TEMPERATURE, 0.2),
    maxTokens: parseNumber(process.env.AI_MAX_TOKENS, 400),
    timeoutMs: parseNumber(process.env.AI_TIMEOUT_MS, 30000),
  };
}
