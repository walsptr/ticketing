import { and, asc, eq } from "drizzle-orm";
import { tickets } from "lib/db/schemas";

type TicketExecutor = {
  query: {
    tickets: {
      findMany: typeof import("config/db").db.query.tickets.findMany;
    };
  };
  update: typeof import("config/db").db.update;
};

export async function getNextOrder(
  executor: TicketExecutor,
  projectId: string,
  phaseId: string
): Promise<number> {
  const phaseTickets = await executor.query.tickets.findMany({
    where: and(eq(tickets.projectId, projectId), eq(tickets.phaseId, phaseId)),
    orderBy: [asc(tickets.order)],
  });

  return phaseTickets.length + 1;
}

export async function reindexPhaseTickets(
  executor: TicketExecutor,
  projectId: string,
  phaseId: string
): Promise<void> {
  const phaseTickets = await executor.query.tickets.findMany({
    where: and(eq(tickets.projectId, projectId), eq(tickets.phaseId, phaseId)),
    orderBy: [asc(tickets.order)],
  });

  for (let i = 0; i < phaseTickets.length; i++) {
    await executor
      .update(tickets)
      .set({ order: i + 1, updatedAt: new Date() })
      .where(eq(tickets.id, phaseTickets[i].id));
  }
}
