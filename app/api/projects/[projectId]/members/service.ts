import { db } from "config/db";
import { and, eq, inArray } from "drizzle-orm";
import { UpdateProjectMembersPayload } from "lib/db/dto/payloads/UpdateProjectMembersPayload";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { UserWithRole } from "lib/db/models";
import { assignedToProjects, projects, users } from "lib/db/schemas";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest } from "next/server";
import { requireManageProjectAccess } from "../../_helpers/access";
import { ManageProjectRow, mapProjectRow } from "../../service";

export async function updateProjectMembers(
  req: NextRequest,
  projectId: string,
  payload: UpdateProjectMembersPayload
): Promise<ManageProjectData> {
  await requireManageProjectAccess(req, projectId);

  if (payload.consultantIds.length > 0) {
    const candidates = (await db.query.users.findMany({
      where: inArray(users.id, payload.consultantIds),
      with: {
        role: true,
      },
    })) as UserWithRole[];

    if (candidates.length !== payload.consultantIds.length) {
      throw new APIResponseError("Ada consultant yang tidak ditemukan", 400);
    }

    const invalidCandidate = candidates.find(
      (user) => user.role?.name?.toLowerCase() !== "consultant"
    );

    if (invalidCandidate) {
      throw new APIResponseError("Hanya user dengan role consultant yang bisa di-assign", 400);
    }
  }

  return await db.transaction(async (tx) => {
    const existing = await tx.query.assignedToProjects.findMany({
      where: eq(assignedToProjects.projectId, projectId),
    });

    const currentIds = new Set(existing.map((item) => item.userId));
    const nextIds = new Set(payload.consultantIds);

    const removeIds = [...currentIds].filter((id) => !nextIds.has(id));
    const addIds = [...nextIds].filter((id) => !currentIds.has(id));

    if (removeIds.length > 0) {
      await tx
        .delete(assignedToProjects)
        .where(
          and(
            eq(assignedToProjects.projectId, projectId),
            inArray(assignedToProjects.userId, removeIds)
          )
        );
    }

    if (addIds.length > 0) {
      await tx.insert(assignedToProjects).values(
        addIds.map((userId) => ({
          projectId,
          userId,
        }))
      );
    }

    const detail = (await tx.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        teamProject: true,
        creator: true,
      },
    })) as ManageProjectRow | undefined;

    if (!detail) throw new APIResponseError("Failed to load project members", 500);
    return await mapProjectRow(detail);
  });
}
