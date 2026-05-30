import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { updateStatus } from "./service";
import { UserData } from "lib/db/dto/responses/UserData";

async function getHandler(req: NextRequest): Promise<NextResponse> {
  const result: UserData = await updateStatus(req);

  return NextResponse.json({
    status: "success",
    message: "Data updated successfully",
    data: result,
  });
}

export const PATCH = handlingLogging(
  handlingError(handlingAuth(getHandler, ["admin"]))
);
