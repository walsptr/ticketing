import { db } from "config/db";
import { eq } from "drizzle-orm";
import { users } from "lib/db/schemas";
import { hashing } from "lib/utils/hashing";
import { getAiRuntimeConfig } from "./config";

export async function ensureAiSupportUser() {
  const config = getAiRuntimeConfig();
  const systemEmail = config?.systemEmail ?? "ai-support@local";
  const systemName = config?.systemName ?? "AI Support";

  const existing = await db.query.users.findFirst({
    where: eq(users.email, systemEmail),
    with: {
      role: true,
    },
  });

  if (existing) {
    return existing;
  }

  const password = await hashing(`${systemEmail}:${Date.now()}`);
  const inserted = await db
    .insert(users)
    .values({
      email: systemEmail,
      name: systemName,
      password,
      isActive: false,
      roleId: null,
    })
    .returning();

  const created = inserted[0];
  if (!created) {
    throw new Error("Failed to create AI Support user");
  }

  return {
    ...created,
    role: null,
  };
}
