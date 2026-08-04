import { db } from "config/db";
import { eq } from "drizzle-orm";
import { resumeAiReplyForLatestUnread } from "lib/ai/ticketAutoReply";
import { UpdateTicketAiAutoReplyPayload } from "lib/db/dto/payloads/UpdateTicketAiAutoReplyPayload";
import { UpdateTicketAiAutoReplyResult } from "lib/db/dto/responses/UpdateTicketAiAutoReplyResult";
import { tickets } from "lib/db/schemas";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { NextRequest } from "next/server";
import { verifyTicketProjectAccess } from "../../service";

export async function updateTicketAiAutoReply(
  req: NextRequest,
  ticketId: string,
  projectId: string,
  payload: UpdateTicketAiAutoReplyPayload
): Promise<UpdateTicketAiAutoReplyResult> {
  await verifyTicketProjectAccess(req, ticketId, projectId);

  const updated = await db
    .update(tickets)
    .set({
      aiAutoReplyEnabled: payload.aiAutoReplyEnabled,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId))
    .returning({
      aiAutoReplyEnabled: tickets.aiAutoReplyEnabled,
    });

  const ticket = updated[0];
  if (!ticket) {
    throw new APIDataNotFoundError();
  }

  const aiReply = payload.aiAutoReplyEnabled
    ? await resumeAiReplyForLatestUnread(ticketId)
    : null;

  return {
    aiAutoReplyEnabled: ticket.aiAutoReplyEnabled,
    aiReply,
  };
}
