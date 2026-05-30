import { db } from "config/db";
import { Role } from "lib/db/models";

export async function getRoles(): Promise<Role[]> {
  const roles: Role[] = await db.query.roles.findMany();
  return roles;
}
