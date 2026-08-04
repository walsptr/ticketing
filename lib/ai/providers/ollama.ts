import { AiRuntimeConfig } from "../config";
import { AiProviderClient, AiProviderRequest } from "../provider";

type OllamaResponse = {
  message?: {
    content?: string;
  };
};

export function createOllamaClient(config: AiRuntimeConfig): AiProviderClient {
  return {
    async complete(request: AiProviderRequest): Promise<string> {
      const response = await fetch(`${config.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: false,
          options: {
            temperature: request.temperature,
            num_predict: request.maxTokens,
          },
        }),
        signal: AbortSignal.timeout(config.timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}`);
      }

      const json = (await response.json()) as OllamaResponse;
      const content = json.message?.content?.trim() ?? "";
      if (!content) {
        throw new Error("Ollama response is empty");
      }

      return content;
    },
  };
}
