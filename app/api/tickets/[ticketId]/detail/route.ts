import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { APIValidationError } from "lib/errors/api/APIValidationError";
import { NextRequest, NextResponse } from "next/server";
import { TicketDetailPageData } from "lib/db/dto/responses/TicketDetailPageData";
import { getTicketDetail } from "./service";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequest): Promise<NextResponse> {
  const ticketId = req.nextUrl.pathname.split("/")[3];
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) throw new APIValidationError({ projectId: "Required" });

  const data: TicketDetailPageData = await getTicketDetail(req, ticketId, projectId);

  return NextResponse.json({
    status: "success",
    message: "Ticket detail fetched successfully",
    data,
  });
}

export const GET = handlingLogging(
  handlingError(handlingAuth(getHandler, ["admin", "consultant", "project coordinator"]))
);
