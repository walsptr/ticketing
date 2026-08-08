export const AI_PLACEHOLDER_FAILED_MESSAGE = "Mohon maaf, AI Support belum dapat membalas ticket ini saat ini. Silakan tunggu balasan dari tim support manusia atau coba refresh halaman beberapa saat lagi.";

export const PLACEHOLDER_PREFIX = "__AI_TYPING_PLACEHOLDER__:";

export function makePlaceholderContent(uuid?: string): string {
  const id = uuid ?? crypto.randomUUID();
  return PLACEHOLDER_PREFIX + id;
}

export function isPlaceholderContent(content: string | null | undefined): boolean {
  if (content === null || content === undefined || typeof content !== "string") {
    return false;
  }
  const regex = new RegExp(`^${PLACEHOLDER_PREFIX}[0-9a-fA-F-]{36}$`);
  return regex.test(String(content));
}

export function isFailedMessage(content: string | null | undefined): boolean {
  if (content === null || content === undefined || typeof content !== "string") {
    return false;
  }
  return String(content) === AI_PLACEHOLDER_FAILED_MESSAGE;
}
