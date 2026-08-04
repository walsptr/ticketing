import { db } from "config/db";
import { and, asc, eq } from "drizzle-orm";
import { MoveTicketPayload } from "lib/db/dto/payloads/MoveTicketPayload";
import { ticketPhases, tickets } from "lib/db/schemas";
import { APIAuthorizationError } from "lib/errors/api/APIAuthorizationError";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest } from "next/server";
import { verifyProjectAccess } from "../service";

function reorderIds(
  ids: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  const next = [...ids];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

export async function moveTicket(
  req: NextRequest,
  payload: MoveTicketPayload
): Promise<void> {
  return await db.transaction(async (tx) => {
    await verifyProjectAccess(req, payload.projectId);

    const ticketData = await tx.query.tickets.findFirst({
      where: eq(tickets.id, payload.ticketId),
    });

    if (!ticketData) throw new APIDataNotFoundError();
    if (ticketData.projectId !== payload.projectId) throw new APIAuthorizationError();

    const fromPhase = await tx.query.ticketPhases.findFirst({
      where: eq(ticketPhases.id, payload.fromPhaseId),
    });
    const toPhase = await tx.query.ticketPhases.findFirst({
      where: eq(ticketPhases.id, payload.toPhaseId),
    });

    if (!fromPhase || !toPhase) throw new APIDataNotFoundError();
    if (fromPhase.projectId !== payload.projectId) throw new APIAuthorizationError();
    if (toPhase.projectId !== payload.projectId) throw new APIAuthorizationError();

    const sourceTickets = await tx.query.tickets.findMany({
      where: and(
        eq(tickets.projectId, payload.projectId),
        eq(tickets.phaseId, payload.fromPhaseId)
      ),
      orderBy: asc(tickets.order),
    });

    if (payload.fromPhaseId === payload.toPhaseId) {
      const ids = sourceTickets.map((t) => t.id);
      const indexFrom = ids.indexOf(payload.ticketId);
      if (indexFrom === -1) throw new APIResponseError("Ticket not in phase", 409);

      const newIds = reorderIds(ids, indexFrom, payload.toIndex);

      for (let i = 0; i < newIds.length; i++) {
        await tx
          .update(tickets)
          .set({ order: i + 1, updatedAt: new Date() })
          .where(eq(tickets.id, newIds[i]));
      }

      return;
    }

    const destTickets = await tx.query.tickets.findMany({
      where: and(
        eq(tickets.projectId, payload.projectId),
        eq(tickets.phaseId, payload.toPhaseId)
      ),
      orderBy: asc(tickets.order),
    });

    const sourceIds = sourceTickets.map((t) => t.id).filter((id) => id !== payload.ticketId);
    const destIds = destTickets.map((t) => t.id);

    const boundedToIndex = Math.min(Math.max(payload.toIndex, 0), destIds.length);
    destIds.splice(boundedToIndex, 0, payload.ticketId);

    for (let i = 0; i < sourceIds.length; i++) {
      await tx
        .update(tickets)
        .set({ order: i + 1, updatedAt: new Date() })
        .where(eq(tickets.id, sourceIds[i]));
    }

    for (let i = 0; i < destIds.length; i++) {
      await tx
        .update(tickets)
        .set({
          phaseId: payload.toPhaseId,
          order: i + 1,
          updatedAt: new Date(),
        })
        .where(eq(tickets.id, destIds[i]));
    }
  });
}
