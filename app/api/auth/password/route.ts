import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { updatePassword } from "./service";
import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { validateAPI } from "lib/utils/validation";
import { putSchema } from "./validation";
import { cookies } from "next/headers";
import { UpdatePasswordPayload } from "lib/db/dto/payloads/UpdatePasswordPayload";

async function putHandler(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json();
  const validated: UpdatePasswordPayload = validateAPI(putSchema, payload);

  await updatePassword(req, validated);

  if (validated.logoutAllDevices) {
    cookies().delete("accessToken");
    cookies().delete("refreshToken");
  }

  return NextResponse.json({
    status: "success",
    message: "Data updated successfully",
  });
}

export const PUT = handlingLogging(handlingError(handlingAuth(putHandler)));
