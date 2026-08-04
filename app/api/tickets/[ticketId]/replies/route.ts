import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { APIValidationError } from "lib/errors/api/APIValidationError";
import { validateAPI } from "lib/utils/validation";
import { postSchema } from "./validation";
import { CreateTicketReplyPayload } from "lib/db/dto/payloads/CreateTicketReplyPayload";
import { CreateTicketReplyResult } from "lib/db/dto/responses/CreateTicketReplyResult";
import { createReply } from "./service";

export const dynamic = "force-dynamic";

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const ticketId = req.nextUrl.pathname.split("/")[3];
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) throw new APIValidationError({ projectId: "Required" });

  const payload = await req.json();
  const validated: CreateTicketReplyPayload = validateAPI(postSchema, payload);
  const data: CreateTicketReplyResult = await createReply(req, ticketId, projectId, validated);

  return NextResponse.json({
    status: "success",
    message: "Reply created successfully",
    data,
  });
}

export const POST = handlingLogging(
  handlingError(handlingAuth(postHandler, ["admin", "consultant", "project coordinator"]))
);
