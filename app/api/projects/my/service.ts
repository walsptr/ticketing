import { db } from "config/db";
import { asc, eq } from "drizzle-orm";
import { ProjectData } from "lib/db/dto/responses/ProjectData";
import { UserWithRole } from "lib/db/models";
import { assignedToProjects, projects } from "lib/db/schemas";
import { APIServerError } from "lib/errors/api/APIServerError";
import { NextRequest } from "next/server";

export async function getMyProjects(req: NextRequest): Promise<ProjectData[]> {
  const requestUser: string | null = req.headers.get("user");
  if (!requestUser) throw new APIServerError();
  const headerUser: UserWithRole = JSON.parse(requestUser);
  const normalizedRole = headerUser.role?.name?.toLowerCase() ?? "";

  if (normalizedRole === "admin" || normalizedRole === "project coordinator") {
    return await db.query.projects.findMany({
      orderBy: [asc(projects.createdAt)],
    });
  }

  const assigned = await db.query.assignedToProjects.findMany({
    where: eq(assignedToProjects.userId, headerUser.id),
    with: {
      project: true,
    },
    orderBy: [asc(assignedToProjects.createdAt)],
  });

  return assigned
    .map((item) => item.project)
    .filter((project): project is ProjectData => Boolean(project));
}
