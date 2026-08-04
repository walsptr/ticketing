import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { getMyProjects } from "./service";
import { ProjectData } from "lib/db/dto/responses/ProjectData";

async function getHandler(req: NextRequest): Promise<NextResponse> {
  const result: ProjectData[] = await getMyProjects(req);

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data: result,
  });
}

export const GET = handlingLogging(
  handlingError(
    handlingAuth(getHandler, ["consultant", "project coordinator", "admin"])
  )
);
