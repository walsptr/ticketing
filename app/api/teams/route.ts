import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { getTeams } from "./service";
import { Team } from "lib/db/models";

async function getHandler(_req: NextRequest): Promise<NextResponse> {
  const result: Team[] = await getTeams();

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data: result,
  });
}

export const GET = handlingLogging(handlingError(handlingAuth(getHandler)));
