import { db } from "config/db";
import { eq } from "drizzle-orm";
import { normalizeMarkdownForStorage } from "lib/ai/markdownPipeline";
import { UpdateTicketPayload } from "lib/db/dto/payloads/UpdateTicketPayload";
import { assignedToTickets, tickets } from "lib/db/schemas";
import { NextRequest } from "next/server";
import {
  mapTicketDetail,
  parseDueDate,
  verifyTicketProjectAccess,
  verifyPhaseProject,
} from "../service";
import { getNextOrder, reindexPhaseTickets } from "../_helpers/order";
import { TicketDetailData } from "lib/db/dto/responses/TicketDetailData";

export async function updateTicket(
  req: NextRequest,
  ticketId: string,
  payload: UpdateTicketPayload
): Promise<TicketDetailData> {
  return await db.transaction(async (tx) => {
    const { ticket } = await verifyTicketProjectAccess(
      req,
      ticketId,
      payload.projectId
    );
    await verifyPhaseProject(payload.phaseId, payload.projectId);
    const dueDate = parseDueDate(payload.dueDate);
    const description = payload.description?.trim()
      ? normalizeMarkdownForStorage(payload.description)
      : "";

    let nextOrder = ticket.order;
    if (ticket.phaseId !== payload.phaseId) {
      nextOrder = await getNextOrder(tx, payload.projectId, payload.phaseId);
    }

    const updated = await tx
      .update(tickets)
      .set({
        title: payload.title,
        description: description || null,
        phaseId: payload.phaseId,
        dueDate,
        order: nextOrder,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticketId))
      .returning();

    if (ticket.phaseId !== payload.phaseId) {
      await reindexPhaseTickets(tx, payload.projectId, ticket.phaseId);
      await reindexPhaseTickets(tx, payload.projectId, payload.phaseId);
    }

    return mapTicketDetail(updated[0]);
  });
}

export async function deleteTicket(
  req: NextRequest,
  ticketId: string,
  projectId: string
): Promise<void> {
  return await db.transaction(async (tx) => {
    const { ticket } = await verifyTicketProjectAccess(req, ticketId, projectId);

    await tx.delete(assignedToTickets).where(eq(assignedToTickets.ticketId, ticketId));
    await tx.delete(tickets).where(eq(tickets.id, ticketId));
    await reindexPhaseTickets(tx, projectId, ticket.phaseId);
  });
}
