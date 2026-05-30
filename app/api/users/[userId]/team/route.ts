import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { updateUserTeam } from "./service";
import { validateAPI } from "lib/utils/validation";
import { putSchema } from "./validation";
import { UserData } from "lib/db/dto/responses/UserData";

async function putHandler(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json();
  const validated: { teamIds: string[] } = validateAPI(putSchema, payload);
  const result: UserData = await updateUserTeam(req, validated);

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data: result,
  });
}

export const PUT = handlingLogging(
  handlingError(handlingAuth(putHandler, ["admin"]))
);
