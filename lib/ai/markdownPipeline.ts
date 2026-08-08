import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { toString } from "mdast-util-to-string";

export type AiChunkType =
  | "heading"
  | "paragraph"
  | "list"
  | "code"
  | "blockquote"
  | "table"
  | "thematicBreak";

export type AiChunk = {
  type: AiChunkType;
  text: string;
  meta?: Record<string, unknown>;
};

function normalizeNewlines(input: string): string {
  return input.replace(/\r\n/g, "\n");
}

function stripHtmlNodes(node: any): any {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node.children)) {
    node.children = node.children
      .filter((child: any) => child?.type !== "html")
      .map((child: any) => stripHtmlNodes(child));
  }
  if (typeof node.value === "string") {
    node.value = normalizeNewlines(node.value);
  }
  return node;
}

function preprocessFenceSanitize(input: string): string {
  const lines = input.split("\n");
  const processed = lines.map((line) => {
    const match = line.match(/^(\s*)([`~]{4,})\s*([a-zA-Z0-9_+-]*)\s*$/);
    if (match) {
      const prefix = match[1];
      const fenceChar = match[2][0];
      const info = match[3];
      const marker3 = fenceChar.repeat(3);
      return prefix + marker3 + (info.trim() ? " " + info : "");
    }
    return line;
  });
  return processed.join("\n");
}

function fallbackMarkdownSanitize(input: string): string {
  let out = normalizeNewlines(String(input ?? ""));
  out = preprocessFenceSanitize(out);
  out = out.replace(/<[^>]+>/g, "");
  out = out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return out.trim();
}

function maskSensitiveInline(input: string): string {
  let out = String(input ?? "");
  out = out.replace(/sk-[A-Za-z0-9_-]+/gi, "sk-***");
  out = out.replace(/([?&](token|api_key|password|key)=[^&#\s]+)/gi, "$1=***");
  if (out.length > 200) {
    out = out.substring(0, 200) + "... (truncated)";
  }
  return out;
}

function createProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStringify as any, {
      bullet: "-",
      fences: true,
      fence: "`",
      listItemIndent: "one",
    });
}

export function normalizeMarkdownForStorage(input: string): string {
  const base = normalizeNewlines(String(input ?? "")).trim();
  if (!base) return "";

  try {
    const sanitizedBase = preprocessFenceSanitize(base);
    const processor = createProcessor();
    const tree = stripHtmlNodes(processor.parse(sanitizedBase));
    const transformed = processor.runSync(tree);
    const out = String(processor.stringify(transformed)).trim();
    return out;
  } catch (err) {
    console.warn(
      "[markdownPipeline] normalizeMarkdownForStorage remark failed (fallback sanitize). Error: %s. Input preview (masked): %s",
      (err as any)?.message ?? String(err),
      maskSensitiveInline(String(input ?? ""))
    );
    return fallbackMarkdownSanitize(input);
  }
}

function joinInlineNodes(nodes: any[]): string {
  return nodes.map((node) => inlineNodeToText(node)).join("");
}

function inlineNodeToText(node: any): string {
  if (!node || typeof node !== "object") return "";

  if (node.type === "text") return String(node.value ?? "");
  if (node.type === "inlineCode") return `\`${String(node.value ?? "")}\``;
  if (node.type === "break") return "\n";

  if (node.type === "link") {
    const label = node.children ? joinInlineNodes(node.children) : toString(node);
    const url = String(node.url ?? "");
    if (url.startsWith("attachment:")) {
      return label.trim()
        ? `Attachment: ${label.trim()} (${url})`
        : `Attachment: ${url}`;
    }
    return label.trim() ? `${label.trim()} (${url})` : url;
  }

  if (node.type === "image") {
    const alt = String(node.alt ?? "").trim();
    const url = String(node.url ?? "");
    const label = alt ? `Image: ${alt}` : "Image";
    return url ? `${label} (${url})` : label;
  }

  if (Array.isArray(node.children)) return joinInlineNodes(node.children);
  return "";
}

function listToText(node: any): { text: string; meta: Record<string, unknown> } {
  const ordered = Boolean(node.ordered);
  const start = typeof node.start === "number" ? node.start : 1;
  const items = Array.isArray(node.children) ? node.children : [];

  const lines = items.map((item: any, idx: number) => {
    const value = blockNodeToText(item).trim();
    if (!value) return "";
    const prefix = ordered ? `${start + idx}.` : "-";
    return `${prefix} ${value}`;
  });

  return {
    text: lines.filter(Boolean).join("\n"),
    meta: { ordered, start },
  };
}

function blockquoteToText(node: any): string {
  const raw = blockNodeChildrenToText(node);
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.map((line) => `> ${line}`).join("\n");
}

function tableToText(node: any): string {
  const rows = Array.isArray(node.children) ? node.children : [];
  const rowText = rows.map((row: any) => {
    const cells = Array.isArray(row.children) ? row.children : [];
    return cells.map((cell: any) => blockNodeChildrenToText(cell).trim()).join(" | ");
  });
  return rowText.filter(Boolean).join("\n");
}

function blockNodeChildrenToText(node: any): string {
  if (!node || typeof node !== "object") return "";
  if (Array.isArray(node.children)) {
    return node.children.map((child: any) => blockNodeToText(child)).join("\n");
  }
  return "";
}

function blockNodeToText(node: any): string {
  if (!node || typeof node !== "object") return "";

  if (node.type === "heading") {
    const level = typeof node.depth === "number" ? node.depth : 1;
    const title = (node.children ? joinInlineNodes(node.children) : toString(node)).trim();
    return `${"#".repeat(Math.min(Math.max(level, 1), 6))} ${title}`.trim();
  }

  if (node.type === "paragraph") {
    return node.children ? joinInlineNodes(node.children).trim() : toString(node).trim();
  }

  if (node.type === "list") {
    return listToText(node).text;
  }

  if (node.type === "listItem") {
    const raw = node.children ? node.children.map((n: any) => blockNodeToText(n)).join("\n") : toString(node);
    return raw.replace(/\n+/g, "\n").trim();
  }

  if (node.type === "code") {
    const lang = String(node.lang ?? "").trim();
    const body = normalizeNewlines(String(node.value ?? "")).trimEnd();
    const header = lang ? `\`\`\`${lang}` : "```";
    return `${header}\n${body}\n\`\`\``.trim();
  }

  if (node.type === "blockquote") {
    return blockquoteToText(node);
  }

  if (node.type === "table") {
    return tableToText(node);
  }

  if (node.type === "thematicBreak") {
    return "---";
  }

  if (Array.isArray(node.children)) {
    return joinInlineNodes(node.children).trim() || toString(node).trim();
  }

  return toString(node).trim();
}

export function markdownToAiChunks(input: string): AiChunk[] {
  const base = normalizeNewlines(String(input ?? "")).trim();
  if (!base) return [];

  try {
    const processor = createProcessor();
    const tree = stripHtmlNodes(processor.parse(base));
    const transformed = processor.runSync(tree) as any;

    const children = Array.isArray(transformed.children) ? transformed.children : [];
    const chunks: AiChunk[] = [];

    for (const child of children) {
      if (!child || typeof child !== "object") continue;

      if (child.type === "heading") {
        const level = typeof child.depth === "number" ? child.depth : 1;
        const text = (child.children ? joinInlineNodes(child.children) : toString(child)).trim();
        if (!text) continue;
        chunks.push({ type: "heading", text, meta: { level } });
        continue;
      }

      if (child.type === "paragraph") {
        const text = blockNodeToText(child);
        if (!text) continue;
        chunks.push({ type: "paragraph", text });
        continue;
      }

      if (child.type === "list") {
        const { text, meta } = listToText(child);
        if (!text) continue;
        chunks.push({ type: "list", text, meta });
        continue;
      }

      if (child.type === "code") {
        const text = blockNodeToText(child);
        if (!text) continue;
        const lang = String(child.lang ?? "").trim() || null;
        chunks.push({ type: "code", text, meta: { lang } });
        continue;
      }

      if (child.type === "blockquote") {
        const text = blockNodeToText(child);
        if (!text) continue;
        chunks.push({ type: "blockquote", text });
        continue;
      }

      if (child.type === "table") {
        const text = blockNodeToText(child);
        if (!text) continue;
        chunks.push({ type: "table", text });
        continue;
      }

      if (child.type === "thematicBreak") {
        chunks.push({ type: "thematicBreak", text: "---" });
        continue;
      }

      const text = blockNodeToText(child);
      if (text) {
        chunks.push({ type: "paragraph", text });
      }
    }

    return chunks;
  } catch (err) {
    console.warn(
      "[markdownPipeline] markdownToAiChunks failed (fallback paragraph). Error: %s. Input preview (masked): %s",
      (err as any)?.message ?? String(err),
      maskSensitiveInline(String(input ?? ""))
    );
    return [{ type: "paragraph", text: fallbackMarkdownSanitize(input) }];
  }
}

export function markdownToAiText(input: string): string {
  try {
    const chunks = markdownToAiChunks(input);
    if (chunks.length === 0) return "";

    const lines: string[] = [];
    for (const chunk of chunks) {
      if (chunk.type === "heading") {
        const level = Number(chunk.meta?.level ?? 1);
        const prefix = "#".repeat(Math.min(Math.max(level, 1), 6));
        lines.push(`${prefix} ${chunk.text}`.trim());
        continue;
      }
      lines.push(chunk.text.trim());
    }

    return lines.filter(Boolean).join("\n\n").trim();
  } catch (err) {
    console.warn(
      "[markdownPipeline] markdownToAiText failed (fallback sanitize). Error: %s. Input preview (masked): %s",
      (err as any)?.message ?? String(err),
      maskSensitiveInline(String(input ?? ""))
    );
    return fallbackMarkdownSanitize(input);
  }
}
