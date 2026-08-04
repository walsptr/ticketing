import { db } from "config/db";
import { and, asc, count, eq, max } from "drizzle-orm";
import { CreateTicketPhasePayload } from "lib/db/dto/payloads/CreateTicketPhasePayload";
import { ReorderTicketPhasePayload } from "lib/db/dto/payloads/ReorderTicketPhasePayload";
import { TicketPhaseData } from "lib/db/dto/responses/TicketPhaseData";
import { ticketPhases, tickets } from "lib/db/schemas";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest } from "next/server";

export async function listTicketPhases(
  _req: NextRequest,
  input: { projectId: string }
): Promise<TicketPhaseData[]> {
  return await db.query.ticketPhases.findMany({
    where: eq(ticketPhases.projectId, input.projectId),
    orderBy: [asc(ticketPhases.order)],
  });
}

export async function createTicketPhase(
  _req: NextRequest,
  payload: CreateTicketPhasePayload
): Promise<TicketPhaseData> {
  return await db.transaction(async (tx) => {
    const currentMax = await tx
      .select({ maxOrder: max(ticketPhases.order) })
      .from(ticketPhases)
      .where(eq(ticketPhases.projectId, payload.projectId));

    const nextOrder = (currentMax[0]?.maxOrder ?? 0) + 1;

    const inserted = await tx
      .insert(ticketPhases)
      .values({
        projectId: payload.projectId,
        name: payload.name,
        order: nextOrder,
      })
      .returning();

    const phase = inserted[0];
    if (!phase) throw new APIResponseError("Failed to create phase", 500);
    return phase;
  });
}

export async function renameTicketPhase(
  _req: NextRequest,
  input: { phaseId: string; name: string }
): Promise<void> {
  const existing = await db.query.ticketPhases.findFirst({
    where: eq(ticketPhases.id, input.phaseId),
  });
  if (!existing) throw new APIDataNotFoundError();

  await db
    .update(ticketPhases)
    .set({ name: input.name, updatedAt: new Date() })
    .where(eq(ticketPhases.id, input.phaseId));
}

export async function deleteTicketPhase(
  _req: NextRequest,
  input: { phaseId: string }
): Promise<void> {
  const existing = await db.query.ticketPhases.findFirst({
    where: eq(ticketPhases.id, input.phaseId),
  });
  if (!existing) throw new APIDataNotFoundError();

  const counter = await db
    .select({ countTicket: count(tickets.id) })
    .from(tickets)
    .where(eq(tickets.phaseId, input.phaseId));

  if (counter[0]?.countTicket) {
    throw new APIResponseError(
      "Phase masih memiliki ticket. Pindahkan ticket terlebih dahulu.",
      409
    );
  }

  await db.delete(ticketPhases).where(eq(ticketPhases.id, input.phaseId));
}

export async function reorderTicketPhases(
  _req: NextRequest,
  payload: ReorderTicketPhasePayload
): Promise<void> {
  return await db.transaction(async (tx) => {
    const phases = await tx.query.ticketPhases.findMany({
      where: eq(ticketPhases.projectId, payload.projectId),
      orderBy: [asc(ticketPhases.order)],
    });

    const phaseIdSet = new Set(phases.map((p) => p.id));
    const uniquePayloadIds = [...new Set(payload.phaseIds)];

    if (uniquePayloadIds.length !== phases.length) {
      throw new APIResponseError("Invalid phaseIds length", 409);
    }

    for (const id of uniquePayloadIds) {
      if (!phaseIdSet.has(id)) {
        throw new APIResponseError("Invalid phaseIds content", 409);
      }
    }

    for (let i = 0; i < uniquePayloadIds.length; i++) {
      await tx
        .update(ticketPhases)
        .set({ order: i + 1, updatedAt: new Date() })
        .where(
          and(
            eq(ticketPhases.id, uniquePayloadIds[i]),
            eq(ticketPhases.projectId, payload.projectId)
          )
        );
    }
  });
}

