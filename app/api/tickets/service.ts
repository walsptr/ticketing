import { db } from "config/db";
import { and, eq } from "drizzle-orm";
import { normalizeMarkdownForStorage } from "lib/ai/markdownPipeline";
import { createInitialAiReplyForTicket } from "lib/ai/ticketAutoReply";
import { CreateTicketPayload } from "lib/db/dto/payloads/CreateTicketPayload";
import { TicketDetailData } from "lib/db/dto/responses/TicketDetailData";
import { AssignedToTicketInsert, UserWithRole } from "lib/db/models";
import {
  assignedToProjects,
  assignedToTickets,
  ticketPhases,
  tickets,
} from "lib/db/schemas";
import { APIAuthorizationError } from "lib/errors/api/APIAuthorizationError";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { APIServerError } from "lib/errors/api/APIServerError";
import { NextRequest } from "next/server";
import { getNextOrder } from "./_helpers/order";

function getRequestUser(req: NextRequest): UserWithRole {
  const requestUser: string | null = req.headers.get("user");
  if (!requestUser) throw new APIServerError();
  return JSON.parse(requestUser) as UserWithRole;
}

function parseDueDate(raw?: string | null): Date | null {
  if (!raw) return null;
  const dueDate = new Date(raw);
  if (Number.isNaN(dueDate.getTime())) {
    throw new APIResponseError("Due date is invalid", 400, {
      dueDate: "Due date is invalid",
    });
  }
  return dueDate;
}

function mapTicketDetail(ticket: typeof tickets.$inferSelect): TicketDetailData {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description ?? null,
    phaseId: ticket.phaseId,
    order: ticket.order,
    referenceCode: ticket.referenceCode,
    dueDate: ticket.dueDate ? ticket.dueDate.toISOString() : null,
    createdBy: ticket.createdBy,
    createdAt: ticket.createdAt ? ticket.createdAt.toISOString() : null,
    updatedAt: ticket.updatedAt ? ticket.updatedAt.toISOString() : null,
  };
}

export async function verifyProjectAccess(
  req: NextRequest,
  projectId: string
): Promise<UserWithRole> {
  const headerUser = getRequestUser(req);
  const normalizedRole = headerUser.role?.name?.toLowerCase() ?? "";

  if (normalizedRole === "admin" || normalizedRole === "project coordinator") {
    return headerUser;
  }

  const membership = await db.query.assignedToProjects.findFirst({
    where: and(
      eq(assignedToProjects.projectId, projectId),
      eq(assignedToProjects.userId, headerUser.id)
    ),
  });

  if (!membership) {
    throw new APIAuthorizationError();
  }

  return headerUser;
}

export async function getTicketById(ticketId: string) {
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
  });

  if (!ticket) throw new APIDataNotFoundError();
  return ticket;
}

export async function verifyTicketProjectAccess(
  req: NextRequest,
  ticketId: string,
  projectId: string
): Promise<{
  headerUser: UserWithRole;
  ticket: typeof tickets.$inferSelect;
}> {
  const headerUser = await verifyProjectAccess(req, projectId);
  const ticket = await getTicketById(ticketId);
  if (ticket.projectId !== projectId) throw new APIAuthorizationError();

  return {
    headerUser,
    ticket,
  };
}

export async function verifyPhaseProject(
  phaseId: string,
  projectId: string
): Promise<void> {
  const phase = await db.query.ticketPhases.findFirst({
    where: eq(ticketPhases.id, phaseId),
  });

  if (!phase) throw new APIDataNotFoundError();
  if (phase.projectId !== projectId) throw new APIAuthorizationError();
}

function generateReferenceCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

async function resolveNewTicketAssignments(
  projectId: string,
  creatorUserId: string
): Promise<string[]> {
  const projectMembers = await db.query.assignedToProjects.findMany({
    where: eq(assignedToProjects.projectId, projectId),
  });

  const assigneeIds = new Set(projectMembers.map((member) => member.userId));
  assigneeIds.add(creatorUserId);

  return [...assigneeIds];
}

export async function createTicket(
  req: NextRequest,
  payload: CreateTicketPayload
): Promise<TicketDetailData> {
  const createdTicket = await db.transaction(async (tx) => {
    const headerUser = await verifyProjectAccess(req, payload.projectId);
    await verifyPhaseProject(payload.phaseId, payload.projectId);

    const order = await getNextOrder(tx, payload.projectId, payload.phaseId);
    const dueDate = parseDueDate(payload.dueDate);
    const description = payload.description?.trim()
      ? normalizeMarkdownForStorage(payload.description)
      : "";

    const inserted = await tx
      .insert(tickets)
      .values({
        projectId: payload.projectId,
        title: payload.title,
        description: description || null,
        phaseId: payload.phaseId,
        createdBy: headerUser.id,
        dueDate,
        order,
        referenceCode: generateReferenceCode(),
      })
      .returning();

    const ticket = inserted[0];
    if (!ticket) throw new APIResponseError("Failed to create ticket", 500);

    const assigneeIds = await resolveNewTicketAssignments(
      payload.projectId,
      headerUser.id
    );

    await tx.insert(assignedToTickets).values(
      assigneeIds.map(
        (userId): AssignedToTicketInsert => ({
          ticketId: ticket.id,
          userId,
        })
      )
    );
    return mapTicketDetail(ticket);
  });

  await createInitialAiReplyForTicket(createdTicket.id);

  return createdTicket;
}

export { getRequestUser, mapTicketDetail, parseDueDate };
