import { db } from "config/db";
import { logger } from "config/winston";
import { and, eq, gte, isNull } from "drizzle-orm";
import { AuthUser, UserWithRole } from "lib/db/models";
import { authUsers, users } from "lib/db/schemas";
import { APIAuthenticationError } from "lib/errors/api/APIAuthenticationError";
import { APIAuthorizationError } from "lib/errors/api/APIAuthorizationError";
import { decodeAccessToken } from "lib/utils/tokenize";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export function handlingAuth(
  handler: (_req: NextRequest) => Promise<NextResponse>,
  roles: string[] = []
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    // verify access token
    const accessToken: string | undefined = cookies().get("accessToken")?.value;

    if (!accessToken) {
      logger.error("invalid access token");
      throw new APIAuthenticationError();
    }

    // decode token
    const decoded: any = await decodeAccessToken(accessToken);

    // verify user
    const userData: UserWithRole | undefined = await db.query.users.findFirst({
      with: {
        role: true,
      },
      where: eq(users.id, decoded.userId),
    });

    if (!userData) {
      logger.error("user not found");
      throw new APIAuthenticationError();
    }

    // verify auth and refresh token
    // should have same user id and device id with decoded data from access token
    // should haven't logout and refresh token is not expired
    const authUser: AuthUser | undefined = await db.query.authUsers.findFirst({
      where: and(
        eq(authUsers.userId, decoded.userId),
        eq(authUsers.deviceId, decoded.deviceId),
        isNull(authUsers.revokedAt),
        gte(authUsers.expiresAt, new Date())
      ),
    });

    if (!authUser) {
      logger.error("invalid auth or refresh token");
      cookies().delete("accessToken");
      cookies().delete("refreshToken");
      throw new APIAuthenticationError();
    }

    // validate authorization based role
    if (roles?.length > 0) {
      if (
        !roles.some(
          (role) => role.toLowerCase() === userData.role?.name.toLowerCase()
        )
      ) {
        logger.error("unauthorized access");
        throw new APIAuthorizationError();
      }
    }

    req.headers.set("user", JSON.stringify(userData));

    return await handler(req);
  };
}
