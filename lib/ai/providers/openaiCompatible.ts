import { AiRuntimeConfig } from "../config";
import { AiProviderClient, AiProviderRequest } from "../provider";

type OpenAiCompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

function stringifyContent(
  content?: string | Array<{ type?: string; text?: string }>
): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .map((item) => (item.type === "text" ? item.text ?? "" : ""))
    .join("")
    .trim();
}

export function createOpenAiCompatibleClient(
  config: AiRuntimeConfig
): AiProviderClient {
  return {
    async complete(request: AiProviderRequest): Promise<string> {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: false,
        }),
        signal: AbortSignal.timeout(config.timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`OpenAI-compatible request failed with status ${response.status}`);
      }

      const json = (await response.json()) as OpenAiCompatibleResponse;
      const content = stringifyContent(json.choices?.[0]?.message?.content);
      if (!content) {
        throw new Error("OpenAI-compatible response is empty");
      }

      return content;
    },
  };
}
