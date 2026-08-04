import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { validateAPI } from "lib/utils/validation";
import { patchMembersSchema } from "../../validation";
import { UpdateProjectMembersPayload } from "lib/db/dto/payloads/UpdateProjectMembersPayload";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { updateProjectMembers } from "./service";

export const dynamic = "force-dynamic";

async function patchHandler(req: NextRequest): Promise<NextResponse> {
  const projectId = req.nextUrl.pathname.split("/")[3];
  const payload = await req.json();
  const validated: UpdateProjectMembersPayload = validateAPI(
    patchMembersSchema,
    payload
  );
  const data: ManageProjectData = await updateProjectMembers(
    req,
    projectId,
    validated
  );

  return NextResponse.json({
    status: "success",
    message: "Project members updated successfully",
    data,
  });
}

export const PATCH = handlingLogging(
  handlingError(handlingAuth(patchHandler, ["admin", "project coordinator"]))
);
