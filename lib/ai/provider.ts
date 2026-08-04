export type AiProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiProviderRequest = {
  model: string;
  messages: AiProviderMessage[];
  temperature?: number;
  maxTokens?: number;
};

export interface AiProviderClient {
  complete(_request: AiProviderRequest): Promise<string>;
}
