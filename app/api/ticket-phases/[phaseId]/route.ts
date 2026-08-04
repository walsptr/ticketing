import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { deleteTicketPhase, renameTicketPhase } from "../service";
import { validateAPI } from "lib/utils/validation";
import { patchSchema } from "../validation";

async function patchHandler(req: NextRequest): Promise<NextResponse> {
  const phaseId = req.nextUrl.pathname.split("/")[3];
  const payload = await req.json();
  const validated: { name: string } = validateAPI(patchSchema, payload);

  await renameTicketPhase(req, { phaseId, name: validated.name });

  return NextResponse.json({
    status: "success",
    message: "Data updated successfully",
  });
}

async function deleteHandler(req: NextRequest): Promise<NextResponse> {
  const phaseId = req.nextUrl.pathname.split("/")[3];
  await deleteTicketPhase(req, { phaseId });

  return NextResponse.json({
    status: "success",
    message: "Data deleted successfully",
  });
}

export const PATCH = handlingLogging(
  handlingError(handlingAuth(patchHandler, ["project coordinator", "admin"]))
);

export const DELETE = handlingLogging(
  handlingError(handlingAuth(deleteHandler, ["project coordinator", "admin"]))
);

