import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { validateAPI } from "lib/utils/validation";
import { patchSchema } from "../validation";
import { UpdateTicketPayload } from "lib/db/dto/payloads/UpdateTicketPayload";
import { deleteTicket, updateTicket } from "./service";
import { TicketDetailData } from "lib/db/dto/responses/TicketDetailData";
import { APIValidationError } from "lib/errors/api/APIValidationError";

async function patchHandler(req: NextRequest): Promise<NextResponse> {
  const ticketId = req.nextUrl.pathname.split("/")[3];
  const payload = await req.json();
  const validated: UpdateTicketPayload = validateAPI(patchSchema, payload);
  const result: TicketDetailData = await updateTicket(req, ticketId, validated);

  return NextResponse.json({
    status: "success",
    message: "Ticket updated successfully",
    data: result,
  });
}

async function deleteHandler(req: NextRequest): Promise<NextResponse> {
  const ticketId = req.nextUrl.pathname.split("/")[3];
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) throw new APIValidationError({ projectId: "Required" });

  await deleteTicket(req, ticketId, projectId);

  return NextResponse.json({
    status: "success",
    message: "Ticket deleted successfully",
  });
}

export const PATCH = handlingLogging(
  handlingError(handlingAuth(patchHandler, ["admin", "consultant", "project coordinator"]))
);

export const DELETE = handlingLogging(
  handlingError(handlingAuth(deleteHandler, ["admin", "consultant", "project coordinator"]))
);
