import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { listProjects, createProject } from "./service";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { validateAPI } from "lib/utils/validation";
import { postSchema } from "./validation";
import { CreateProjectPayload } from "lib/db/dto/payloads/CreateProjectPayload";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequest): Promise<NextResponse> {
  const data: ManageProjectData[] = await listProjects(req);

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data,
  });
}

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json();
  const validated: CreateProjectPayload = validateAPI(postSchema, payload);
  const data: ManageProjectData = await createProject(req, validated);

  return NextResponse.json({
    status: "success",
    message: "Project created successfully",
    data,
  });
}

export const GET = handlingLogging(
  handlingError(
    handlingAuth(getHandler, ["admin", "project coordinator", "consultant"])
  )
);

export const POST = handlingLogging(
  handlingError(handlingAuth(postHandler, ["admin", "project coordinator"]))
);
