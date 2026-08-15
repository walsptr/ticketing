import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { createUser, getUsers } from "./service";
import { UserData } from "lib/db/dto/responses/UserData";
import { validateAPI } from "lib/utils/validation";
import { postSchema } from "./validation";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequest): Promise<NextResponse> {
  const result: UserData[] = await getUsers(req);

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data: result,
  });
}

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const raw = await req.json();
  const validated = validateAPI(postSchema, raw);
  const result = await createUser(req, validated);

  return NextResponse.json(
    {
      status: "success",
      message: "User created successfully",
      data: result,
    },
    { status: 201 }
  );
}

export const GET = handlingLogging(handlingError(handlingAuth(getHandler)));
export const POST = handlingLogging(
  handlingError(handlingAuth(postHandler, ["admin"]))
);
