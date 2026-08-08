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

export function normalizeProviderName(raw: string): AiProviderName | null {
  const normalized = raw.trim().toLowerCase().replace(/[-_]/g, "");

  const openAiCompatibleAliases = [
    "openai",
    "openaicompatible",
    "openaicompat",
    "openaiapi",
  ];

  const ollamaAliases = [
    "ollama",
    "localollama",
  ];

  if (openAiCompatibleAliases.includes(normalized)) {
    return "openai-compatible";
  }

  if (ollamaAliases.includes(normalized)) {
    return "ollama";
  }

  return null;
}

export function getAiRuntimeConfigWithIssues(): {
  config: AiRuntimeConfig | null;
  issues: string[];
} {
  const issues: string[] = [];

  const providerRaw = (process.env.AI_PROVIDER ?? "").trim();
  const baseUrl = (process.env.AI_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const model = (process.env.AI_MODEL ?? "").trim();

  if (!providerRaw) {
    issues.push("AI_PROVIDER is required but empty");
  }

  if (!baseUrl) {
    issues.push("AI_BASE_URL is required but empty");
  }

  if (!model) {
    issues.push("AI_MODEL is required but empty");
  }

  let provider: AiProviderName | null = null;
  if (providerRaw) {
    provider = normalizeProviderName(providerRaw);
    if (!provider) {
      issues.push(`AI_PROVIDER has invalid value: "${providerRaw}"`);
    }
  }

  if (baseUrl && !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    issues.push(`AI_BASE_URL has invalid value (must start with http:// or https://): "${baseUrl}"`);
  }

  if (issues.length > 0 || !provider) {
    return { config: null, issues };
  }

  return {
    config: {
      provider,
      baseUrl,
      apiKey: (process.env.AI_API_KEY ?? "").trim(),
      model,
      systemEmail: (process.env.AI_SYSTEM_EMAIL ?? "ai-support@local").trim(),
      systemName: (process.env.AI_SYSTEM_NAME ?? "AI Support").trim(),
      temperature: parseNumber(process.env.AI_TEMPERATURE, 0.2),
      maxTokens: parseNumber(process.env.AI_MAX_TOKENS, 400),
      timeoutMs: parseNumber(process.env.AI_TIMEOUT_MS, 30000),
    },
    issues,
  };
}

export function getAiRuntimeConfig(): AiRuntimeConfig | null {
  return getAiRuntimeConfigWithIssues().config;
}
