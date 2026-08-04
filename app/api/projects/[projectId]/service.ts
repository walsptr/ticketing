import { db } from "config/db";
import { count, eq } from "drizzle-orm";
import { UpdateProjectPayload } from "lib/db/dto/payloads/UpdateProjectPayload";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { projects, ticketPhases, tickets } from "lib/db/schemas";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest } from "next/server";
import { requireManageProjectAccess } from "../_helpers/access";
import { assertProjectSlugAvailable, buildProjectSlug } from "../_helpers/slug";
import { ManageProjectRow, mapProjectRow } from "../service";

export async function updateProject(
  req: NextRequest,
  projectId: string,
  payload: UpdateProjectPayload
): Promise<ManageProjectData> {
  const { project } = await requireManageProjectAccess(req, projectId);
  const name = payload.name.trim();
  const slug = buildProjectSlug(name);

  if (!project.teamId) {
    throw new APIResponseError("Project tidak memiliki team", 409);
  }

  await assertProjectSlugAvailable(slug, project.teamId, projectId);

  await db
    .update(projects)
    .set({
      name,
      slug,
      description: payload.description?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  const detail = (await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      teamProject: true,
      creator: true,
    },
  })) as ManageProjectRow | undefined;

  if (!detail) throw new APIResponseError("Failed to load updated project", 500);
  return await mapProjectRow(detail);
}

export async function deleteProject(
  req: NextRequest,
  projectId: string
): Promise<void> {
  await requireManageProjectAccess(req, projectId);

  const phaseCounter = await db
    .select({ countPhase: count(ticketPhases.id) })
    .from(ticketPhases)
    .where(eq(ticketPhases.projectId, projectId));

  if (phaseCounter[0]?.countPhase) {
    throw new APIResponseError(
      "Project masih memiliki phase. Hapus phase terlebih dahulu.",
      409
    );
  }

  const ticketCounter = await db
    .select({ countTicket: count(tickets.id) })
    .from(tickets)
    .where(eq(tickets.projectId, projectId));

  if (ticketCounter[0]?.countTicket) {
    throw new APIResponseError(
      "Project masih memiliki ticket. Hapus ticket terlebih dahulu.",
      409
    );
  }

  await db.delete(projects).where(eq(projects.id, projectId));
}
