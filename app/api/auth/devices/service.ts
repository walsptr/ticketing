import { db } from "config/db";
import { and, desc, eq, gte, isNull } from "drizzle-orm";
import { UserWithRole } from "lib/db/models";
import { authUsers } from "lib/db/schemas";
import { UAParser } from "ua-parser-js";
import { APIServerError } from "lib/errors/api/APIServerError";
import { DeviceData } from "lib/db/dto/responses/DeviceData";
import { NextRequest } from "next/server";

export async function getDevices(req: NextRequest): Promise<DeviceData[]> {
  // get data logged in user from header
  const requestUser: string | null = req.headers.get("user");
  if (!requestUser) throw new APIServerError();
  const headerUser: UserWithRole = JSON.parse(requestUser);

  const authsData: DeviceData[] = await db
    .selectDistinctOn([authUsers.deviceId], {
      id: authUsers.id,
      deviceId: authUsers.deviceId,
      userAgent: authUsers.userAgent,
      createdAt: authUsers.createdAt,
    })
    .from(authUsers)
    .where(
      and(
        eq(authUsers.userId, headerUser.id),
        isNull(authUsers.revokedAt),
        gte(authUsers.expiresAt, new Date())
      )
    )
    .orderBy(authUsers.deviceId, desc(authUsers.createdAt));

  const devices: DeviceData[] = [];
  for (const auth of authsData) {
    const parser = new UAParser(auth.userAgent ?? "");

    devices.push({
      id: auth.id,
      deviceId: auth.deviceId,
      userAgent: {
        browser: parser.getBrowser(),
        os: parser.getOS(),
        device: parser.getDevice(),
      },
      createdAt: auth.createdAt,
    });
  }

  return devices;
}
