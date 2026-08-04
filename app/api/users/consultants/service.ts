import { db } from "config/db";
import { asc } from "drizzle-orm";
import { ProjectMemberData } from "lib/db/dto/responses/ProjectMemberData";
import { UserWithRole } from "lib/db/models";
import { users } from "lib/db/schemas";

export async function listConsultants(): Promise<ProjectMemberData[]> {
  const consultants = (await db.query.users.findMany({
    with: {
      role: true,
    },
    orderBy: [asc(users.name)],
  })) as UserWithRole[];

  return consultants
    .filter((user) => user.role?.name?.toLowerCase() === "consultant")
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      roleName: user.role?.name ?? null,
    }));
}
