import { validateAPI } from "lib/utils/validation";
import { postSchema } from "./validation";
import { NextRequest, NextResponse } from "next/server";
import { login } from "./service";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { cookies } from "next/headers";
import { LoginPayload } from "lib/db/dto/payloads/LoginPayload";
import { UserData } from "lib/db/dto/responses/UserData";
import { AuthData } from "lib/db/dto/responses/AuthData";

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json();
  const validated: LoginPayload = validateAPI(postSchema, payload);

  const { user, auth }: { user: UserData; auth: AuthData } = await login(
    req,
    validated
  );

  cookies().set("accessToken", auth.accessToken, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15, // 15 menit
  });

  cookies().set("refreshToken", auth.refreshToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  cookies().set("deviceId", auth.deviceId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 tahun
  });

  return NextResponse.json({
    status: "success",
    message: "Login successfully",
    data: user,
  });
}

export const POST = handlingLogging(handlingError(postHandler));
