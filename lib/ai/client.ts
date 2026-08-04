import { logger } from "config/winston";
import { AiRuntimeConfig, getAiRuntimeConfig } from "./config";
import { AiProviderClient } from "./provider";
import { createOllamaClient } from "./providers/ollama";
import { createOpenAiCompatibleClient } from "./providers/openaiCompatible";

export function getAiClient(): {
  client: AiProviderClient;
  config: AiRuntimeConfig;
} | null {
  const config = getAiRuntimeConfig();
  if (!config) {
    logger.warn("AI runtime config is incomplete. AI auto-reply is skipped.");
    return null;
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
