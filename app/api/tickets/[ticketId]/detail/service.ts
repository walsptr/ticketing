import { db } from "config/db";
import { eq } from "drizzle-orm";
import { TicketDetailPageData } from "lib/db/dto/responses/TicketDetailPageData";
import { TicketReplyData } from "lib/db/dto/responses/TicketReplyData";
import { Role } from "lib/db/models";
import { tickets } from "lib/db/schemas";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { NextRequest } from "next/server";
import { verifyTicketProjectAccess } from "../../service";

type DetailReplyWithRole = {
  id: string;
  userId: string;
  content: string;
  isAi: boolean;
  replyToReplyId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role | null;
  };
};

type DetailTicketWithRelations = typeof tickets.$inferSelect & {
  project: {
    id: string;
    name: string;
    slug: string;
  } | null;
  phase: {
    id: string;
    name: string;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
    role: Role | null;
  } | null;
  ticketReplies: DetailReplyWithRole[];
};

export async function getTicketDetail(
  req: NextRequest,
  ticketId: string,
  projectId: string
): Promise<TicketDetailPageData> {
  const { headerUser } = await verifyTicketProjectAccess(
    req,
    ticketId,
    projectId
  );

  const detailTicket = (await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
    with: {
      project: true,
      phase: true,
      creator: {
        with: {
          role: true,
        },
      },
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
  })) as DetailTicketWithRelations | undefined;

  if (!detailTicket || !detailTicket.project || !detailTicket.phase || !detailTicket.creator) {
    throw new APIDataNotFoundError();
  }

  const replies: TicketReplyData[] = detailTicket.ticketReplies
    .sort((a, b) => {
      const left = a.createdAt?.getTime() ?? 0;
      const right = b.createdAt?.getTime() ?? 0;
      return left - right;
    })
    .map((reply) => ({
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
      isOwner: reply.userId === headerUser.id,
      isAi: reply.isAi,
      replyToReplyId: reply.replyToReplyId ?? null,
    }));

  return {
    ticket: {
      id: detailTicket.id,
      title: detailTicket.title,
      description: detailTicket.description ?? null,
      referenceCode: detailTicket.referenceCode,
      aiAutoReplyEnabled: detailTicket.aiAutoReplyEnabled,
      dueDate: detailTicket.dueDate ? detailTicket.dueDate.toISOString() : null,
      createdAt: detailTicket.createdAt ? detailTicket.createdAt.toISOString() : null,
      updatedAt: detailTicket.updatedAt ? detailTicket.updatedAt.toISOString() : null,
    },
    project: {
      id: detailTicket.project.id,
      name: detailTicket.project.name,
      slug: detailTicket.project.slug,
    },
    phase: {
      id: detailTicket.phase.id,
      name: detailTicket.phase.name,
    },
    creator: {
      id: detailTicket.creator.id,
      name: detailTicket.creator.name,
      email: detailTicket.creator.email,
      roleName: detailTicket.creator.role?.name ?? null,
    },
    replies,
  };
}
