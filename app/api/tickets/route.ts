import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { validateAPI } from "lib/utils/validation";
import { postSchema } from "./validation";
import { CreateTicketPayload } from "lib/db/dto/payloads/CreateTicketPayload";
import { createTicket } from "./service";
import { TicketDetailData } from "lib/db/dto/responses/TicketDetailData";

export const dynamic = "force-dynamic";

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json();
  const validated: CreateTicketPayload = validateAPI(postSchema, payload);
  const result: TicketDetailData = await createTicket(req, validated);

  return NextResponse.json({
    status: "success",
    message: "Ticket created successfully",
    data: result,
  });
}

export const POST = handlingLogging(
  handlingError(handlingAuth(postHandler, ["admin", "consultant", "project coordinator"]))
);
