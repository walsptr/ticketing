import { db } from "config/db";
import { and, eq, ne } from "drizzle-orm";
import { projects } from "lib/db/schemas";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { generateSlug } from "lib/utils/slug";

export function buildProjectSlug(name: string): string {
  return generateSlug(name);
}

export async function assertProjectSlugAvailable(
  slug: string,
  teamId: string,
  ignoreProjectId?: string
): Promise<void> {
  const existing = await db.query.projects.findFirst({
    where: ignoreProjectId
      ? and(
          eq(projects.slug, slug),
          eq(projects.teamId, teamId),
          ne(projects.id, ignoreProjectId)
        )
      : and(eq(projects.slug, slug), eq(projects.teamId, teamId)),
  });

  if (existing) {
    throw new APIResponseError("Slug project sudah digunakan pada team ini", 409, {
      name: "Project name generates duplicate slug",
    });
  }
}
