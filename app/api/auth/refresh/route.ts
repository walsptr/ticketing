import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { refreshToken } from "./service";
import { cookies } from "next/headers";
import { AuthData } from "lib/db/dto/responses/AuthData";

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const result: AuthData = await refreshToken(req);

  cookies().set("accessToken", result.accessToken, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15, // 15 menit
  });

  cookies().set("refreshToken", result.refreshToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return NextResponse.json({
    status: "success",
    message: "Token refreshed successfully",
  });
}

export const POST = handlingLogging(handlingError(postHandler));
