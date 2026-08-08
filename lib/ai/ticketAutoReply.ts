import {
  AI_PLACEHOLDER_FAILED_MESSAGE,
  isPlaceholderContent,
  makePlaceholderContent,
} from "./placeholder";
import { logger } from "config/winston";
import { db } from "config/db";
import { and, eq, isNull } from "drizzle-orm";
import { TicketReplyData } from "lib/db/dto/responses/TicketReplyData";
import { Role } from "lib/db/models";
import { ticketReplies, tickets } from "lib/db/schemas";
import { getAiClient } from "./client";
import { ensureAiSupportUser } from "./ensureAiSupportUser";
export { ensureAiSupportUser };
import { markdownToAiText, normalizeMarkdownForStorage } from "./markdownPipeline";

type TicketThreadReply = typeof ticketReplies.$inferSelect & {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role | null;
  } | null;
};

type TicketThread = typeof tickets.$inferSelect & {
  project: {
    id: string;
    name: string;
    slug: string;
  } | null;
  phase: {
    id: string;
    name: string;
  } | null;
  ticketReplies: TicketThreadReply[];
};

function mapAiReplyData(
  reply: typeof ticketReplies.$inferSelect & {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role | null;
    };
  }
): TicketReplyData {
  return {
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt ? reply.createdAt.toISOString() : null,
    updatedAt: reply.updatedAt ? reply.updatedAt.toISOString() : null,
    author: {
      id: reply.user.id,
      name: reply.user.name,
      email: reply.user.email,
      roleName: null,
    },
    isOwner: false,
    isAi: true,
    replyToReplyId: reply.replyToReplyId ?? null,
  };
}

async function loadTicketThread(ticketId: string) {
  return (await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
    with: {
      project: true,
      phase: true,
      ticketReplies: {
        with: {
          user: {
            with: {
              role: true,
            },
          },
        },
        orderBy: (reply, { asc }) => [asc(reply.createdAt), asc(reply.updatedAt)],
      },
    },
  })) as TicketThread | undefined;
}

function buildThreadTranscript(thread: TicketThread): string {
  const recentReplies = thread.ticketReplies.slice(-12);
  if (recentReplies.length === 0) return "Belum ada reply pada thread ini.";

  return recentReplies
    .map((reply) => {
      const authorName = reply.isAi ? "AI Support" : reply.user?.name ?? "Unknown User";
      const prefix = reply.isAi ? "[AI]" : "[User]";
      return `${prefix} ${authorName}:\n${markdownToAiText(reply.content) || "-"}`;
    })
    .join("\n\n");
}

function buildCreatePrompt(thread: TicketThread): string {
  const description = markdownToAiText(thread.description ?? "") || "Tidak ada deskripsi.";
  return [
    `Project: ${thread.project?.name ?? "-"}`,
    `Phase: ${thread.phase?.name ?? "-"}`,
    `Judul Ticket: ${thread.title}`,
    "",
    "Deskripsi Ticket:",
    description,
    "",
    "Tugas kamu:",
    "- Balas sebagai support engineer AI yang membantu analisis awal.",
    "- Gunakan markdown yang ringkas dan mudah dibaca.",
    "- Berikan analisis singkat, langkah awal, dan pertanyaan klarifikasi jika memang perlu.",
    "- Jangan menyebut keterbatasan model atau menyarankan RAG/vector database.",
  ].join("\n");
}

function buildReplyPrompt(
  thread: TicketThread,
  targetReply: TicketThread["ticketReplies"][number]
): string {
  const description = markdownToAiText(thread.description ?? "") || "Tidak ada deskripsi.";
  const targetText = markdownToAiText(targetReply.content) || "-";

  return [
    `Project: ${thread.project?.name ?? "-"}`,
    `Phase: ${thread.phase?.name ?? "-"}`,
    `Judul Ticket: ${thread.title}`,
    "",
    "Deskripsi Ticket:",
    description,
    "",
    "Ringkasan Thread Terbaru:",
    buildThreadTranscript(thread),
    "",
    "Reply manusia terbaru yang harus dijawab:",
    targetText,
    "",
    "Tugas kamu:",
    "- Balas sebagai support engineer AI yang membantu diskusi ticket.",
    "- Gunakan markdown yang ringkas dan langsung ke solusi.",
    "- Fokus menjawab reply terbaru dengan tetap mempertimbangkan konteks thread.",
    "- Jika perlu klarifikasi, tanyakan secara spesifik dan singkat.",
  ].join("\n");
}

async function generateAiMarkdown(prompt: string): Promise<string | null> {
  const runtime = getAiClient();
  if (!runtime) {
    return null;
  }

  const content = await runtime.client.complete({
    model: runtime.config.model,
    temperature: runtime.config.temperature,
    maxTokens: runtime.config.maxTokens,
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah AI support engineer internal. Balas dalam markdown yang ringkas, sopan, dan fokus membantu troubleshooting serta tindak lanjut ticket.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const normalized = normalizeMarkdownForStorage(content);
  return normalized || null;
}

async function insertAiReply(args: {
  ticketId: string;
  content: string;
  aiUserId: string;
  replyToReplyId?: string | null;
}): Promise<TicketReplyData | null> {
  const inserted = (await db
    .insert(ticketReplies)
    .values({
      ticketId: args.ticketId,
      userId: args.aiUserId,
      content: args.content,
      isAi: true,
      replyToReplyId: args.replyToReplyId ?? null,
      duration: 0,
    })
    .returning()) as Array<typeof ticketReplies.$inferSelect>;

  const created = inserted[0];
  if (!created) return null;

  const detailReply = (await db.query.ticketReplies.findFirst({
    where: eq(ticketReplies.id, created.id),
    with: {
      user: {
        with: {
          role: true,
        },
      },
    },
  })) as
    | (typeof ticketReplies.$inferSelect & {
        user: {
          id: string;
          name: string;
          email: string;
          role: Role | null;
        } | null;
      })
    | undefined;

  if (!detailReply?.user) {
    return null;
  }

  return mapAiReplyData(
    detailReply as typeof ticketReplies.$inferSelect & {
      user: {
        id: string;
        name: string;
        email: string;
        role: Role | null;
      };
    }
  );
}

export function scheduleBackgroundTask(fn: () => Promise<void>, contextLabel: string): void {
  const safeTask = async () => {
    try { await fn(); }
    catch (err) { logger.warn("AI background task failed", { contextLabel, error: err }); }
  };
  if (typeof (globalThis as any).setImmediate === "function") { (globalThis as any).setImmediate(safeTask); }
  else { setTimeout(safeTask, 0); }
}

export async function ensureInsertAiPlaceholder(args: { ticketId: string; aiUserId: string; replyToReplyId?: string | null; }): Promise<{ replyId: string; placeholderContent: string; inserted: boolean; }> {
  const existingItems = await db.query.ticketReplies.findMany({
    where: and(
      eq(ticketReplies.ticketId, args.ticketId),
      eq(ticketReplies.isAi, true),
      args.replyToReplyId ? eq(ticketReplies.replyToReplyId, args.replyToReplyId) : isNull(ticketReplies.replyToReplyId)
    )
  });

  for (const item of existingItems) {
    if (isPlaceholderContent(item.content)) {
      return { replyId: item.id, placeholderContent: item.content, inserted: false };
    }
  }

  const placeholderContent = makePlaceholderContent();
  const inserted = (await db
    .insert(ticketReplies)
    .values({
      ticketId: args.ticketId,
      userId: args.aiUserId,
      content: placeholderContent,
      isAi: true,
      replyToReplyId: args.replyToReplyId ?? null,
      duration: 0,
    })
    .returning()) as Array<typeof ticketReplies.$inferSelect>;

  const row = inserted[0];
  return { replyId: row.id, placeholderContent, inserted: true };
}

export async function resolveAiPlaceholderReply(args: { placeholderReplyId: string; finalContent: string | null; failed?: boolean; }): Promise<void> {
  try {
    const final = (!args.failed && args.finalContent !== null) ? String(args.finalContent) : AI_PLACEHOLDER_FAILED_MESSAGE;
    await db.update(ticketReplies).set({ content: final }).where(eq(ticketReplies.id, args.placeholderReplyId));
  } catch (err) {
    logger.warn("Failed to resolve AI placeholder reply", { placeholderReplyId: args.placeholderReplyId, error: err });
  }
}

export async function createInitialAiReplyForTicket(
  ticketId: string,
  opts?: { placeholderReplyId?: string }
): Promise<TicketReplyData | null> {
  const placeholderReplyId = opts?.placeholderReplyId;
  try {
    const thread = await loadTicketThread(ticketId);
    if (!thread || !thread.aiAutoReplyEnabled || !thread.project || !thread.phase) {
      return null;
    }

    const existingInitialAiReply = await db.query.ticketReplies.findFirst({
      where: and(eq(ticketReplies.ticketId, ticketId), eq(ticketReplies.isAi, true), isNull(ticketReplies.replyToReplyId)),
    });
    if (existingInitialAiReply) {
      const isSelfPlaceholder = isPlaceholderContent(existingInitialAiReply.content);
      const isOwnTarget = typeof placeholderReplyId === "string" && existingInitialAiReply.id === placeholderReplyId;
      if (!isSelfPlaceholder && !isOwnTarget) {
        return null;
      }
    }

    const usePlaceholder = typeof placeholderReplyId === "string" && placeholderReplyId.length > 0;

    const aiUser = await ensureAiSupportUser();
    const prompt = buildCreatePrompt(thread);
    const content = await generateAiMarkdown(prompt);

    if (usePlaceholder) {
      await resolveAiPlaceholderReply({ placeholderReplyId, finalContent: content, failed: !content });
      return null;
    }

    if (!content) {
      return null;
    }

    return await insertAiReply({
      ticketId,
      content,
      aiUserId: aiUser.id,
      replyToReplyId: null,
    });
  } catch (error) {
    logger.warn("Failed to create initial AI reply", { ticketId, error });
    const usePlaceholder = typeof placeholderReplyId === "string" && placeholderReplyId.length > 0;
    if (usePlaceholder) {
      await resolveAiPlaceholderReply({ placeholderReplyId, finalContent: null, failed: true });
    }
    return null;
  }
}

export async function createAiReplyForHumanReply(
  ticketId: string,
  humanReplyId: string,
  opts?: { placeholderReplyId?: string }
): Promise<TicketReplyData | null> {
  const placeholderReplyId = opts?.placeholderReplyId;
  try {
    const thread = await loadTicketThread(ticketId);
    if (!thread || !thread.aiAutoReplyEnabled || !thread.project || !thread.phase) {
      return null;
    }

    const targetReply = thread.ticketReplies.find(
      (reply) => reply.id === humanReplyId && !reply.isAi
    );
    if (!targetReply) {
      return null;
    }

    const existingAiReply = await db.query.ticketReplies.findFirst({
      where: and(
        eq(ticketReplies.ticketId, ticketId),
        eq(ticketReplies.isAi, true),
        eq(ticketReplies.replyToReplyId, humanReplyId)
      ),
    });
    if (existingAiReply) {
      const isSelfPlaceholder = isPlaceholderContent(existingAiReply.content);
      const isOwnTarget = typeof placeholderReplyId === "string" && existingAiReply.id === placeholderReplyId;
      if (!isSelfPlaceholder && !isOwnTarget) {
        return null;
      }
    }

    const usePlaceholder = typeof placeholderReplyId === "string" && placeholderReplyId.length > 0;

    const aiUser = await ensureAiSupportUser();
    const prompt = buildReplyPrompt(thread, targetReply);
    const content = await generateAiMarkdown(prompt);

    if (usePlaceholder) {
      await resolveAiPlaceholderReply({ placeholderReplyId, finalContent: content, failed: !content });
      return null;
    }

    if (!content) {
      return null;
    }

    return await insertAiReply({
      ticketId,
      content,
      aiUserId: aiUser.id,
      replyToReplyId: humanReplyId,
    });
  } catch (error) {
    logger.warn("Failed to create AI reply for human reply", {
      ticketId,
      humanReplyId,
      error,
    });
    const usePlaceholder = typeof placeholderReplyId === "string" && placeholderReplyId.length > 0;
    if (usePlaceholder) {
      await resolveAiPlaceholderReply({ placeholderReplyId, finalContent: null, failed: true });
    }
    return null;
  }
}

export async function resumeAiReplyForLatestUnread(
  ticketId: string
): Promise<TicketReplyData | null> {
  const thread = await loadTicketThread(ticketId);
  if (!thread) {
    return null;
  }

  const repliedIds = new Set(
    thread.ticketReplies
      .filter((reply) => reply.isAi && reply.replyToReplyId)
      .map((reply) => reply.replyToReplyId as string)
  );

  const latestUnreadHumanReply = [...thread.ticketReplies]
    .reverse()
    .find((reply) => !reply.isAi && !repliedIds.has(reply.id));

  if (!latestUnreadHumanReply) {
    return null;
  }

  return await createAiReplyForHumanReply(ticketId, latestUnreadHumanReply.id);
}
