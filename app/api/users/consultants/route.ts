import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { listConsultants } from "./service";
import { ProjectMemberData } from "lib/db/dto/responses/ProjectMemberData";

async function getHandler(_req: NextRequest): Promise<NextResponse> {
  const data: ProjectMemberData[] = await listConsultants();

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data,
  });
}

export const GET = handlingLogging(
  handlingError(
    handlingAuth(getHandler, ["admin", "project coordinator", "consultant"])
  )
);
