import { db } from "config/db";
import { asc, eq } from "drizzle-orm";
import { CreateProjectPayload } from "lib/db/dto/payloads/CreateProjectPayload";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { ProjectMemberData } from "lib/db/dto/responses/ProjectMemberData";
import { Role } from "lib/db/models";
import { assignedToProjects, projects } from "lib/db/schemas";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest } from "next/server";
import {
  getProjectActor,
  requireManageProjectActor,
} from "./_helpers/access";
import { assertProjectSlugAvailable, buildProjectSlug } from "./_helpers/slug";

function mapMember(input: {
  id: string;
  name: string;
  email: string;
  roleName: string | null;
}): ProjectMemberData {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    roleName: input.roleName,
  };
}

type ProjectMembershipWithRole = typeof assignedToProjects.$inferSelect & {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role | null;
  } | null;
};

export type ManageProjectRow = typeof projects.$inferSelect & {
  teamProject?: { id: string; name: string } | null;
  creator?: { id: string; name: string } | null;
};

export async function mapProjectRow(
  project: ManageProjectRow
): Promise<ManageProjectData> {
  const membership = (await db.query.assignedToProjects.findMany({
    where: eq(assignedToProjects.projectId, project.id),
    with: {
      user: {
        with: {
          role: true,
        },
      },
    },
    orderBy: [asc(assignedToProjects.createdAt)],
  })) as ProjectMembershipWithRole[];

  const members = membership
    .filter(
      (item): item is ProjectMembershipWithRole & {
        user: NonNullable<ProjectMembershipWithRole["user"]>;
      } => item.user?.role?.name?.toLowerCase() === "consultant"
    )
    .map((item) =>
      mapMember({
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
        roleName: item.user.role?.name ?? null,
      })
    );

  return {
    id: project.id,
    teamId: project.teamId ?? null,
    teamName: project.teamProject?.name ?? null,
    name: project.name,
    slug: project.slug,
    description: project.description ?? null,
    createdBy: project.createdBy,
    createdByName: project.creator?.name ?? null,
    createdAt: project.createdAt ? project.createdAt.toISOString() : null,
    updatedAt: project.updatedAt ? project.updatedAt.toISOString() : null,
    members,
  };
}

export async function listProjects(req: NextRequest): Promise<ManageProjectData[]> {
  const actor = getProjectActor(req);

  if (actor.canManage) {
    const rows = (await db.query.projects.findMany({
      with: {
        teamProject: true,
        creator: true,
      },
      orderBy: [asc(projects.createdAt)],
    })) as ManageProjectRow[];

    return await Promise.all(rows.map((row) => mapProjectRow(row)));
  }

  const membership = await db.query.assignedToProjects.findMany({
    where: eq(assignedToProjects.userId, actor.user.id),
    with: {
      project: {
        with: {
          teamProject: true,
          creator: true,
        },
      },
    },
    orderBy: [asc(assignedToProjects.createdAt)],
  });

  const rows = membership
    .map((item) => item.project)
    .filter(Boolean) as ManageProjectRow[];

  return await Promise.all(rows.map((row) => mapProjectRow(row)));
}

export async function createProject(
  req: NextRequest,
  payload: CreateProjectPayload
): Promise<ManageProjectData> {
  const actor = await requireManageProjectActor(req);

  const normalizedName = payload.name.trim();
  const teamId = payload.teamId ?? null;

  if (!teamId) {
    throw new APIResponseError("Team project wajib ditentukan", 400, {
      teamId: "Required",
    });
  }

  const slug = buildProjectSlug(normalizedName);
  await assertProjectSlugAvailable(slug, teamId);

  const inserted = await db
    .insert(projects)
    .values({
      teamId,
      name: normalizedName,
      slug,
      description: payload.description?.trim() || null,
      createdBy: actor.user.id,
    })
    .returning();

  const project = inserted[0];
  if (!project) throw new APIResponseError("Failed to create project", 500);

  const detail = (await db.query.projects.findFirst({
    where: eq(projects.id, project.id),
    with: {
      teamProject: true,
      creator: true,
    },
  })) as ManageProjectRow | undefined;

  if (!detail) throw new APIResponseError("Failed to load created project", 500);
  return await mapProjectRow(detail);
}
