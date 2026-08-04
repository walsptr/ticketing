import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { APIValidationError } from "lib/errors/api/APIValidationError";
import { validateAPI } from "lib/utils/validation";
import { NextRequest, NextResponse } from "next/server";
import { UpdateTicketAiAutoReplyPayload } from "lib/db/dto/payloads/UpdateTicketAiAutoReplyPayload";
import { UpdateTicketAiAutoReplyResult } from "lib/db/dto/responses/UpdateTicketAiAutoReplyResult";
import { patchSchema } from "./validation";
import { updateTicketAiAutoReply } from "./service";

export const dynamic = "force-dynamic";

async function patchHandler(req: NextRequest): Promise<NextResponse> {
  const ticketId = req.nextUrl.pathname.split("/")[3];
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) throw new APIValidationError({ projectId: "Required" });

  const payload = await req.json();
  const validated: UpdateTicketAiAutoReplyPayload = validateAPI(patchSchema, payload);
  const data: UpdateTicketAiAutoReplyResult = await updateTicketAiAutoReply(
    req,
    ticketId,
    projectId,
    validated
  );

  return NextResponse.json({
    status: "success",
    message: validated.aiAutoReplyEnabled
      ? "AI takeover enabled successfully"
      : "Support takeover enabled successfully",
    data,
  });
}

export const PATCH = handlingLogging(
  handlingError(handlingAuth(patchHandler, ["admin", "consultant", "project coordinator"]))
);
