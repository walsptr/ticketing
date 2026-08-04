import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { validateAPI } from "lib/utils/validation";
import { patchSchema } from "../validation";
import { UpdateProjectPayload } from "lib/db/dto/payloads/UpdateProjectPayload";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { deleteProject, updateProject } from "./service";

export const dynamic = "force-dynamic";

async function patchHandler(req: NextRequest): Promise<NextResponse> {
  const projectId = req.nextUrl.pathname.split("/")[3];
  const payload = await req.json();
  const validated: UpdateProjectPayload = validateAPI(patchSchema, payload);
  const data: ManageProjectData = await updateProject(req, projectId, validated);

  return NextResponse.json({
    status: "success",
    message: "Project updated successfully",
    data,
  });
}

async function deleteHandler(req: NextRequest): Promise<NextResponse> {
  const projectId = req.nextUrl.pathname.split("/")[3];
  await deleteProject(req, projectId);

  return NextResponse.json({
    status: "success",
    message: "Project deleted successfully",
  });
}

export const PATCH = handlingLogging(
  handlingError(handlingAuth(patchHandler, ["admin", "project coordinator"]))
);

export const DELETE = handlingLogging(
  handlingError(handlingAuth(deleteHandler, ["admin", "project coordinator"]))
);
