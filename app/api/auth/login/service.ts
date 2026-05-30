import { db } from "config/db";
import { and, desc, eq } from "drizzle-orm";
import { AuthUser, UserWithRoleTeam } from "lib/db/models";
import { authUsers, users } from "lib/db/schemas";
import { hashing, verifyHash } from "lib/utils/hashing";
import { APIAuthenticationError } from "lib/errors/api/APIAuthenticationError";
import { createAccessToken, createRefreshToken } from "lib/utils/tokenize";
import { v4 as uuidV4 } from "uuid";
import { cookies } from "next/headers";
import { LoginPayload } from "lib/db/dto/payloads/LoginPayload";
import { UserData } from "lib/db/dto/responses/UserData";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest } from "next/server";
import { mapperSingleUserWithRoleTeam } from "lib/db/mapper/UserToTeam";
import { AuthData } from "lib/db/dto/responses/AuthData";
import { logger } from "config/winston";

export async function login(
  req: NextRequest,
  payload: LoginPayload
): Promise<{ user: UserData; auth: AuthData }> {
  // check email
  const userData: UserWithRoleTeam | undefined = await db.query.users.findFirst(
    {
      where: eq(users.email, payload.email),
      with: {
        role: true,
        usersToTeams: {
          with: {
            team: true,
          },
        },
      },
    }
  );

  if (!userData) {
    logger.error("user not found");
    throw new APIAuthenticationError();
  }

  // check password
  const verifiedPassword: boolean = await verifyHash(
    payload.password,
    userData.password
  );
  if (!verifiedPassword) {
    logger.error("password is incorrect");
    throw new APIAuthenticationError();
  }

  // check device id
  let deviceId: string | undefined = cookies().get("deviceId")?.value;
  const userAgent: string = req.headers.get("user-agent")?.toString() ?? "";
  const ipAddress: string =
    req.headers.get("x-forwarded-for")?.toString() ?? "";

  if (deviceId) {
    const authDevice: AuthUser | undefined = await db.query.authUsers.findFirst(
      {
        where: and(
          eq(authUsers.deviceId, deviceId),
          eq(authUsers.userId, userData.id)
        ),
        orderBy: [desc(authUsers.createdAt)],
      }
    );

    // check user has already logged in on same device
    const isLoggedIn: boolean =
      authDevice?.revokedAt === null && authDevice.expiresAt > new Date();

    // verify device has same user agent
    const verifiedDevice: boolean = authDevice?.userAgent === userAgent;

    if (isLoggedIn) {
      throw new APIResponseError(
        "You are already logged in on this device",
        409
      );
    } else if (authDevice && !verifiedDevice) {
      logger.error("user agent is different from stored at database");
      throw new APIAuthenticationError();
    }
  } else {
    // generate new device id
    deviceId = uuidV4();
  }

  // create user auth
  const accessToken: string = await createAccessToken(
    userData.id,
    deviceId as string
  );

  const refreshToken: string = createRefreshToken();
  const now: Date = new Date();

  await db.insert(authUsers).values({
    userId: userData.id,
    refreshToken: await hashing(refreshToken),
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 hari
    userAgent: userAgent,
    ip: ipAddress,
    deviceId,
  });

  const mapperUserData: UserData = mapperSingleUserWithRoleTeam(userData);
  const authData: AuthData = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    deviceId: deviceId,
  };

  return { user: mapperUserData, auth: authData };
}
