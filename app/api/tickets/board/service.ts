import { db } from "config/db";
import { asc, eq } from "drizzle-orm";
import { TicketBoardData } from "lib/db/dto/responses/TicketBoardData";
import { TicketCardData } from "lib/db/dto/responses/TicketCardData";
import { ticketPhases, tickets } from "lib/db/schemas";
import { NextRequest } from "next/server";
import { verifyProjectAccess } from "../service";

export async function getTicketBoard(
  req: NextRequest,
  input: { projectId: string }
): Promise<TicketBoardData> {
  await verifyProjectAccess(req, input.projectId);

  const phases = await db.query.ticketPhases.findMany({
    where: eq(ticketPhases.projectId, input.projectId),
    orderBy: [asc(ticketPhases.order)],
  });

  const ticketRows = await db.query.tickets.findMany({
    where: eq(tickets.projectId, input.projectId),
    orderBy: [asc(tickets.phaseId), asc(tickets.order)],
  });

  const ticketData: TicketCardData[] = ticketRows.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    phaseId: t.phaseId,
    order: t.order,
    referenceCode: t.referenceCode,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
  }));

  return {
    phases,
    tickets: ticketData,
  };
}
