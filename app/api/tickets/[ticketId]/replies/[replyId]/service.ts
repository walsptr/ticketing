import { db } from "config/db";
import { and, eq } from "drizzle-orm";
import { normalizeMarkdownForStorage } from "lib/ai/markdownPipeline";
import { UpdateTicketReplyPayload } from "lib/db/dto/payloads/UpdateTicketReplyPayload";
import { TicketReplyData } from "lib/db/dto/responses/TicketReplyData";
import { ticketReplies } from "lib/db/schemas";
import { APIAuthorizationError } from "lib/errors/api/APIAuthorizationError";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest } from "next/server";
import { verifyTicketProjectAccess } from "../../../service";
import { mapReply } from "../service";

async function verifyReplyOwnership(
  req: NextRequest,
  ticketId: string,
  replyId: string,
  projectId: string
) {
  const { headerUser } = await verifyTicketProjectAccess(req, ticketId, projectId);

  const reply = await db.query.ticketReplies.findFirst({
    where: and(eq(ticketReplies.id, replyId), eq(ticketReplies.ticketId, ticketId)),
    with: {
      user: {
        with: {
          role: true,
        },
      },
    },
  });

  if (!reply || !reply.user) throw new APIDataNotFoundError();
  if (reply.userId !== headerUser.id) throw new APIAuthorizationError();

  return { headerUser, reply };
}

export async function updateReply(
  req: NextRequest,
  ticketId: string,
  replyId: string,
  projectId: string,
  payload: UpdateTicketReplyPayload
): Promise<TicketReplyData> {
  const { headerUser } = await verifyReplyOwnership(req, ticketId, replyId, projectId);
  const content = normalizeMarkdownForStorage(payload.content);
  if (!content) {
    throw new APIResponseError("Content is required", 400, { content: "Required" });
  }

  return await db.transaction(async (tx) => {
    const updated = await tx
      .update(ticketReplies)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(and(eq(ticketReplies.id, replyId), eq(ticketReplies.ticketId, ticketId)))
      .returning();

    const reply = updated[0];
    if (!reply) throw new APIResponseError("Failed to update reply", 500);

    const detailReply = await tx.query.ticketReplies.findFirst({
      where: eq(ticketReplies.id, reply.id),
      with: {
        user: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!detailReply || !detailReply.user) throw new APIDataNotFoundError();
    return mapReply(detailReply, headerUser.id);
  });
}

export async function deleteReply(
  req: NextRequest,
  ticketId: string,
  replyId: string,
  projectId: string
): Promise<void> {
  await verifyReplyOwnership(req, ticketId, replyId, projectId);

  await db
    .delete(ticketReplies)
    .where(and(eq(ticketReplies.id, replyId), eq(ticketReplies.ticketId, ticketId)));
}
