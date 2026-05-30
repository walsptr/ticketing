import { db } from "config/db";
import { logger } from "config/winston";
import { eq } from "drizzle-orm";
import { UserData } from "lib/db/dto/responses/UserData";
import { mapperSingleUserWithRoleTeam } from "lib/db/mapper/UserToTeam";
import { UserWithRole, UserWithRoleTeam } from "lib/db/models";
import { users } from "lib/db/schemas";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { APIServerError } from "lib/errors/api/APIServerError";
import { NextRequest } from "next/server";

export async function updateStatus(req: NextRequest): Promise<UserData> {
  // get data logged in user from header
  const requestUser: string | null = req.headers.get("user");
  if (!requestUser) throw new APIServerError();
  const headerUser: UserWithRole = JSON.parse(requestUser);

  // if logged in user is inactive
  if (!headerUser.isActive) {
    logger.error("user is inactive");
    throw new APIResponseError(
      "Can't deactivate the user, because you're is inactive",
      409
    );
  }

  const userId: string = req.nextUrl.pathname.split("/")[3];

  // check id user
  const userData: UserWithRoleTeam | undefined = await db.query.users.findFirst(
    {
      where: eq(users.id, userId),
      with: {
        usersToTeams: {
          with: {
            team: true,
          },
        },
        role: true,
      },
    }
  );

  if (!userData) {
    logger.error("user data not found");
    throw new APIDataNotFoundError();
  }

  const mapperUserData: UserData = mapperSingleUserWithRoleTeam(userData);

  // update status
  const returning: { isActive: boolean }[] = await db
    .update(users)
    .set({ isActive: !userData.isActive, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ isActive: users.isActive });

  mapperUserData.isActive = returning[0].isActive;
  return mapperUserData;
}
