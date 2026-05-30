import { User } from "lib/db/models";
import { APIServerError } from "lib/errors/api/APIServerError";
import { hashing, verifyHash } from "lib/utils/hashing";
import { APIValidationError } from "lib/errors/api/APIValidationError";
import { db } from "config/db";
import { authUsers, users } from "lib/db/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { UpdatePasswordPayload } from "lib/db/dto/payloads/UpdatePasswordPayload";
import { NextRequest } from "next/server";
import { logger } from "config/winston";

export async function updatePassword(
  req: NextRequest,
  payload: UpdatePasswordPayload
): Promise<void> {
  await db.transaction(async (tx) => {
    // get data logged in user from header
    const requestUser: string | null = req.headers.get("user");
    if (!requestUser) throw new APIServerError();
    const headerUser: User = JSON.parse(requestUser);

    // verified password
    const verified: boolean = await verifyHash(
      payload.currentPassword,
      headerUser.password
    );
    if (!verified) {
      logger.error("incorrect current password");
      throw new APIValidationError({
        currentPassword: "Current password is incorrect",
      });
    }

    // update password
    await tx
      .update(users)
      .set({
        password: await hashing(payload.newPassword),
        updatedAt: new Date(),
      })
      .where(eq(users.id, headerUser.id));

    // logout all devices?
    if (payload.logoutAllDevices) {
      await tx
        .update(authUsers)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(
          and(eq(authUsers.userId, headerUser.id), isNull(authUsers.revokedAt))
        );
    }
  });
}
