import { db } from "config/db";
import { logger } from "config/winston";
import { and, desc, eq, isNull } from "drizzle-orm";
import { AuthData } from "lib/db/dto/responses/AuthData";
import { AuthUser } from "lib/db/models";
import { authUsers } from "lib/db/schemas";
import { APIAuthenticationError } from "lib/errors/api/APIAuthenticationError";
import { hashing, verifyHash } from "lib/utils/hashing";
import { createAccessToken, createRefreshToken } from "lib/utils/tokenize";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function refreshToken(req: NextRequest): Promise<AuthData> {
  return await db.transaction(async (tx) => {
    const deviceId: string = cookies().get("deviceId")?.value ?? "";

    // get auth user by device id
    const authUserData: AuthUser[] = await tx.query.authUsers.findMany({
      where: eq(authUsers.deviceId, deviceId),
      orderBy: [desc(authUsers.createdAt)],
    });

    // if there are not recognized deviceId
    if (authUserData.length === 0) {
      logger.error("auth data is not found");
      cookies().delete("refreshToken");
      throw new APIAuthenticationError();
    } else if (authUserData[0].revokedAt !== null) {
      // verify device id with new refresh token haven't logout
      logger.error("this device id already logged out");
      cookies().delete("refreshToken");
      throw new APIAuthenticationError();
    } else {
      // verify refresh token with new record
      const verified: boolean = await verifyHash(
        cookies().get("refreshToken")?.value ?? "",
        authUserData[0].refreshToken
      );

      // if unverified or expired
      if (!verified || authUserData[0].expiresAt < new Date()) {
        // force logout with this device id
        await tx
          .update(authUsers)
          .set({ revokedAt: new Date(), updatedAt: new Date() })
          .where(
            and(eq(authUsers.deviceId, deviceId), isNull(authUsers.revokedAt))
          );

        logger.error("this refresh token is invalid or already expired");
        cookies().delete("refreshToken");
        throw new APIAuthenticationError();
      }

      // create new token and update to database
      const accessToken: string = await createAccessToken(
        authUserData[0].userId,
        deviceId
      );
      const refreshToken: string = createRefreshToken();

      await tx
        .update(authUsers)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(authUsers.id, authUserData[0].id));

      await tx.insert(authUsers).values({
        userId: authUserData[0].userId,
        refreshToken: await hashing(refreshToken),
        expiresAt: authUserData[0].expiresAt,
        userAgent: req.headers.get("user-agent"),
        ip: req.headers.get("x-forwarded-for"),
        deviceId: authUserData[0].deviceId,
      });

      const authData: AuthData = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        deviceId: authUserData[0].deviceId,
      };

      return authData;
    }
  });
}
