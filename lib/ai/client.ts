import { logger } from "config/winston";
import { AiRuntimeConfig, getAiRuntimeConfigWithIssues } from "./config";
import { AiProviderClient } from "./provider";
import { createOllamaClient } from "./providers/ollama";
import { createOpenAiCompatibleClient } from "./providers/openaiCompatible";

function maskApiKey(apiKey: string): string {
  if (!apiKey) {
    return "tidak diset";
  }
  if (apiKey.length <= 8) {
    return "****";
  }
  const first4 = apiKey.slice(0, 4);
  const last4 = apiKey.slice(-4);
  const middle = "*".repeat(Math.max(0, apiKey.length - 8));
  return `${first4}${middle}${last4}`;
}

function maskValue(value: string): string {
  if (!value) {
    return "tidak diset";
  }
  if (value.length <= 8) {
    return "****";
  }
  const first4 = value.slice(0, 4);
  const last4 = value.slice(-4);
  const middle = "*".repeat(Math.max(0, value.length - 8));
  return `${first4}${middle}${last4}`;
}

export function getAiClient(): {
  client: AiProviderClient;
  config: AiRuntimeConfig;
} | null {
  const { config, issues } = getAiRuntimeConfigWithIssues();
  const providerRaw = (process.env.AI_PROVIDER ?? "").trim();
  const baseUrl = (process.env.AI_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const model = (process.env.AI_MODEL ?? "").trim();
  const apiKey = (process.env.AI_API_KEY ?? "").trim();

  if (!config || issues.length > 0) {
    const issuesStr = issues.length > 0 ? issues.join(" ; ") : "tidak ada detail";
    logger.warn(
      `AI runtime config is incomplete. Issues: ${issuesStr}. Current providerRaw: ${maskValue(providerRaw)} baseUrl: ${maskValue(baseUrl)}, model: ${maskValue(model)}, apiKey: ${maskApiKey(apiKey)}`
    );
    if (!config) {
      return null;
    }
  }

  if (config.provider === "ollama") {
    return {
      client: createOllamaClient(config),
      config,
    };
  }

  return {
    client: createOpenAiCompatibleClient(config),
    config,
  };
}
