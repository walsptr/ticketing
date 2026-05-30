import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { logout } from "./service";
import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { cookies } from "next/headers";

async function postHandler(req: NextRequest): Promise<NextResponse> {
  await logout(req);

  cookies().delete("accessToken");
  cookies().delete("refreshToken");

  return NextResponse.json({
    status: "success",
    message: "Logout successfully",
  });
}

export const POST = handlingLogging(handlingError(handlingAuth(postHandler)));
