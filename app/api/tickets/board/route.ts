import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { getTicketBoard } from "./service";
import { TicketBoardData } from "lib/db/dto/responses/TicketBoardData";
import { APIValidationError } from "lib/errors/api/APIValidationError";

async function getHandler(req: NextRequest): Promise<NextResponse> {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) throw new APIValidationError({ projectId: "Required" });

  const result: TicketBoardData = await getTicketBoard(req, { projectId });

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data: result,
  });
}

export const GET = handlingLogging(
  handlingError(handlingAuth(getHandler, ["admin", "consultant", "project coordinator"]))
);
