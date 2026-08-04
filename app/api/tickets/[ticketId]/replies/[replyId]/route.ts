import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { APIValidationError } from "lib/errors/api/APIValidationError";
import { validateAPI } from "lib/utils/validation";
import { patchSchema } from "../validation";
import { UpdateTicketReplyPayload } from "lib/db/dto/payloads/UpdateTicketReplyPayload";
import { TicketReplyData } from "lib/db/dto/responses/TicketReplyData";
import { deleteReply, updateReply } from "./service";

export const dynamic = "force-dynamic";

async function patchHandler(req: NextRequest): Promise<NextResponse> {
  const ticketId = req.nextUrl.pathname.split("/")[3];
  const replyId = req.nextUrl.pathname.split("/")[5];
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) throw new APIValidationError({ projectId: "Required" });

  const payload = await req.json();
  const validated: UpdateTicketReplyPayload = validateAPI(patchSchema, payload);
  const data: TicketReplyData = await updateReply(
    req,
    ticketId,
    replyId,
    projectId,
    validated
  );

  return NextResponse.json({
    status: "success",
    message: "Reply updated successfully",
    data,
  });
}

async function deleteHandler(req: NextRequest): Promise<NextResponse> {
  const ticketId = req.nextUrl.pathname.split("/")[3];
  const replyId = req.nextUrl.pathname.split("/")[5];
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) throw new APIValidationError({ projectId: "Required" });

  await deleteReply(req, ticketId, replyId, projectId);

  return NextResponse.json({
    status: "success",
    message: "Reply deleted successfully",
  });
}

export const PATCH = handlingLogging(
  handlingError(handlingAuth(patchHandler, ["admin", "consultant", "project coordinator"]))
);

export const DELETE = handlingLogging(
  handlingError(handlingAuth(deleteHandler, ["admin", "consultant", "project coordinator"]))
);
