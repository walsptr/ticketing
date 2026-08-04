import { db } from "config/db";
import { and, eq } from "drizzle-orm";
import { UserWithRole } from "lib/db/models";
import { assignedToProjects, projects } from "lib/db/schemas";
import { APIAuthorizationError } from "lib/errors/api/APIAuthorizationError";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIServerError } from "lib/errors/api/APIServerError";
import { NextRequest } from "next/server";

export type ManageProjectActor = {
  user: UserWithRole;
  normalizedRole: string;
  canManage: boolean;
};

export function getProjectActor(req: NextRequest): ManageProjectActor {
  const requestUser = req.headers.get("user");
  if (!requestUser) throw new APIServerError();

  const user = JSON.parse(requestUser) as UserWithRole;
  const normalizedRole = user.role?.name?.toLowerCase() ?? "";
  const canManage =
    normalizedRole === "admin" || normalizedRole === "project coordinator";

  if (!canManage && normalizedRole !== "consultant") {
    throw new APIAuthorizationError();
  }

  return {
    user,
    normalizedRole,
    canManage,
  };
}

export async function requireManageProjectActor(
  req: NextRequest
): Promise<ManageProjectActor> {
  const actor = getProjectActor(req);
  if (!actor.canManage) throw new APIAuthorizationError();
  return actor;
}

export async function getProjectById(projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) throw new APIDataNotFoundError();
  return project;
}

export async function requireManageProjectAccess(
  req: NextRequest,
  projectId: string
): Promise<{
  actor: ManageProjectActor;
  project: typeof projects.$inferSelect;
}> {
  const actor = await requireManageProjectActor(req);
  const project = await getProjectById(projectId);

  return { actor, project };
}

export async function requireViewProjectAccess(
  req: NextRequest,
  projectId: string
): Promise<{
  actor: ManageProjectActor;
  project: typeof projects.$inferSelect;
}> {
  const actor = getProjectActor(req);
  const project = await getProjectById(projectId);

  if (
    actor.normalizedRole === "admin" ||
    actor.normalizedRole === "project coordinator"
  ) {
    return { actor, project };
  }

  if (actor.normalizedRole === "consultant") {
    const membership = await db.query.assignedToProjects.findFirst({
      where: and(
        eq(assignedToProjects.projectId, projectId),
        eq(assignedToProjects.userId, actor.user.id)
      ),
    });

    if (!membership) throw new APIAuthorizationError();
  }

  return { actor, project };
}
