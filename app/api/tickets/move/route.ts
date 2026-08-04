import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { moveTicket } from "./service";
import { validateAPI } from "lib/utils/validation";
import { postSchema } from "./validation";
import { MoveTicketPayload } from "lib/db/dto/payloads/MoveTicketPayload";

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json();
  const validated: MoveTicketPayload = validateAPI(postSchema, payload);

  await moveTicket(req, validated);

  return NextResponse.json({
    status: "success",
    message: "Ticket updated successfully",
  });
}

export const POST = handlingLogging(
  handlingError(handlingAuth(postHandler, ["admin", "consultant", "project coordinator"]))
);
