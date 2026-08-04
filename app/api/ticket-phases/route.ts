import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { createTicketPhase, listTicketPhases } from "./service";
import { APIValidationError } from "lib/errors/api/APIValidationError";
import { validateAPI } from "lib/utils/validation";
import { postSchema } from "./validation";
import { CreateTicketPhasePayload } from "lib/db/dto/payloads/CreateTicketPhasePayload";

async function getHandler(req: NextRequest): Promise<NextResponse> {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) throw new APIValidationError({ projectId: "Required" });

  const result = await listTicketPhases(req, { projectId });

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data: result,
  });
}

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json();
  const validated: CreateTicketPhasePayload = validateAPI(postSchema, payload);

  const result = await createTicketPhase(req, validated);

  return NextResponse.json({
    status: "success",
    message: "Data created successfully",
    data: result,
  });
}

export const GET = handlingLogging(
  handlingError(handlingAuth(getHandler, ["project coordinator", "admin"]))
);

export const POST = handlingLogging(
  handlingError(handlingAuth(postHandler, ["project coordinator", "admin"]))
);

