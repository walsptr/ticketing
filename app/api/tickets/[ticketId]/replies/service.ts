import { db } from "config/db";
import { logger } from "config/winston";
import { eq } from "drizzle-orm";
import { normalizeMarkdownForStorage } from "lib/ai/markdownPipeline";
import {
  createAiReplyForHumanReply,
  ensureAiSupportUser,
  ensureInsertAiPlaceholder,
  scheduleBackgroundTask,
} from "lib/ai/ticketAutoReply";
import { CreateTicketReplyPayload } from "lib/db/dto/payloads/CreateTicketReplyPayload";
import { CreateTicketReplyResult } from "lib/db/dto/responses/CreateTicketReplyResult";
import { TicketReplyData } from "lib/db/dto/responses/TicketReplyData";
import { Role } from "lib/db/models";
import { ticketReplies, tickets } from "lib/db/schemas";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest } from "next/server";
import { verifyTicketProjectAccess } from "../../service";

type TicketReplyWithAuthorRole = typeof ticketReplies.$inferSelect & {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role | null;
  };
};

function mapReply(
  reply: TicketReplyWithAuthorRole,
  currentUserId: string
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
      roleName: reply.user.role?.name ?? null,
    },
    isOwner: reply.user.id === currentUserId,
    isAi: reply.isAi,
    replyToReplyId: reply.replyToReplyId ?? null,
  };
}

export async function createReply(
  req: NextRequest,
  ticketId: string,
  projectId: string,
  payload: CreateTicketReplyPayload
): Promise<CreateTicketReplyResult> {
  const { headerUser } = await verifyTicketProjectAccess(req, ticketId, projectId);
  const content = normalizeMarkdownForStorage(payload.content);
  if (!content) {
    throw new APIResponseError("Content is required", 400, { content: "Required" });
  }

  const reply = await db.transaction(async (tx) => {
    const inserted = (await tx
      .insert(ticketReplies)
      .values({
        ticketId,
        userId: headerUser.id,
        content,
        duration: 0,
      })
      .returning()) as Array<typeof ticketReplies.$inferSelect>;

    const reply = inserted[0];
    if (!reply) throw new APIResponseError("Failed to create reply", 500);

    const detailReply = (await tx.query.ticketReplies.findFirst({
      where: eq(ticketReplies.id, reply.id),
      with: {
        user: {
          with: {
            role: true,
          },
        },
      },
    })) as TicketReplyWithAuthorRole | undefined;

    if (!detailReply || !detailReply.user) {
      throw new APIDataNotFoundError();
    }

    return mapReply(detailReply, headerUser.id);
  });

  const aiReply = null;

  const quickTicket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
    columns: { aiAutoReplyEnabled: true, id: true },
  });

  if (quickTicket?.aiAutoReplyEnabled) {
    try {
      const aiUser = await ensureAiSupportUser();
      const placeholder = await ensureInsertAiPlaceholder({
        ticketId,
        aiUserId: aiUser.id,
        replyToReplyId: reply.id,
      });

      scheduleBackgroundTask(
        () => createAiReplyForHumanReply(ticketId, reply.id, { placeholderReplyId: placeholder.replyId }).then(() => undefined),
        `followup-ai:${ticketId}:${reply.id}`
      );
    } catch (err) {
      logger.warn("Failed to queue followup AI placeholder for reply", {
        ticketId, replyId: reply.id, error: err,
      });
    }
  }

  return { reply, aiReply };
}

export { mapReply };
