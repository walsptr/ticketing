import { db } from "config/db";
import { logger } from "config/winston";
import { eq } from "drizzle-orm";
import { UserData } from "lib/db/dto/responses/UserData";
import { mapperSingleUserWithRoleTeam } from "lib/db/mapper/UserToTeam";
import {
  UserToTeamInsert,
  UserWithRole,
  UserWithRoleTeam,
} from "lib/db/models";
import { users, usersToTeams } from "lib/db/schemas";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { APIServerError } from "lib/errors/api/APIServerError";
import { NextRequest } from "next/server";

export async function updateUserTeam(
  req: NextRequest,
  payload: { teamIds: string[] }
): Promise<UserData> {
  return await db.transaction(async (tx) => {
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

    // verify user id and check user role
    const userData: UserWithRole | undefined = await tx.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        role: true,
      },
    });

    if (!userData) {
      logger.error("user not found");
      throw new APIDataNotFoundError();
    }

    // verify role is consultant
    if (userData.role?.name !== "consultant") {
      logger.error("user role is not compatible");
      throw new APIResponseError(
        "User with this role can't assign to team",
        409
      );
    }

    // remove all users teams
    await tx.delete(usersToTeams).where(eq(usersToTeams.userId, userId));

    // create new team
    const data: UserToTeamInsert[] = [];
    payload.teamIds.forEach((teamId) => {
      data.push({
        userId: userId,
        teamId: teamId,
      });
    });

    await tx.insert(usersToTeams).values(data);

    // get new data users
    const newUserData: UserWithRoleTeam | undefined =
      await tx.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          role: true,
          usersToTeams: {
            with: {
              team: true,
            },
          },
        },
      });

    if (!newUserData) {
      logger.info("user data not found");
      throw new APIDataNotFoundError();
    }

    return mapperSingleUserWithRoleTeam(newUserData);
  });
}
