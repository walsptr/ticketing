import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { reorderTicketPhases } from "../service";
import { validateAPI } from "lib/utils/validation";
import { reorderSchema } from "../validation";
import { ReorderTicketPhasePayload } from "lib/db/dto/payloads/ReorderTicketPhasePayload";

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json();
  const validated: ReorderTicketPhasePayload = validateAPI(reorderSchema, payload);

  await reorderTicketPhases(req, validated);

  return NextResponse.json({
    status: "success",
    message: "Data updated successfully",
  });
}

export const POST = handlingLogging(
  handlingError(handlingAuth(postHandler, ["project coordinator", "admin"]))
);

