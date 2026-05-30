import { db } from "config/db";
import { logger } from "config/winston";
import { and, desc, eq, gte, isNull } from "drizzle-orm";
import { AuthUser, UserWithRole } from "lib/db/models";
import { authUsers } from "lib/db/schemas";
import { APIAuthenticationError } from "lib/errors/api/APIAuthenticationError";
import { APIServerError } from "lib/errors/api/APIServerError";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function logout(req: NextRequest): Promise<void> {
  // get data logged in user from header
  const requestUser: string | null = req.headers.get("user");
  if (!requestUser) throw new APIServerError();
  const headerUser: UserWithRole = JSON.parse(requestUser);

  // get auth user
  const deviceId: string = cookies().get("deviceId")?.value ?? "";
  const authUserData: AuthUser | undefined = await db.query.authUsers.findFirst(
    {
      where: and(
        eq(authUsers.userId, headerUser.id),
        eq(authUsers.deviceId, deviceId),
        isNull(authUsers.revokedAt),
        gte(authUsers.expiresAt, new Date())
      ),
      orderBy: [desc(authUsers.createdAt)],
    }
  );

  if (!authUserData) {
    logger.error("auth data not found");
    throw new APIAuthenticationError();
  }

  // update auth user
  await db
    .update(authUsers)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(authUsers.deviceId, deviceId),
        isNull(authUsers.revokedAt),
        eq(authUsers.userId, headerUser.id)
      )
    );
}
