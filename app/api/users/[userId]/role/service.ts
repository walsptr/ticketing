import { db } from "config/db";
import { logger } from "config/winston";
import { count, eq } from "drizzle-orm";
import { UserData } from "lib/db/dto/responses/UserData";
import { mapperSingleUserWithRoleTeam } from "lib/db/mapper/UserToTeam";
import { Role, UserWithRole, UserWithRoleTeam } from "lib/db/models";
import { roles, users, usersToTeams } from "lib/db/schemas";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { APIServerError } from "lib/errors/api/APIServerError";
import { NextRequest } from "next/server";

export async function updateUserRole(
  req: NextRequest,
  payload: { roleId: string }
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

    // verify user id
    const counterUser: { countUser: number }[] = await tx
      .select({ countUser: count(users.id) })
      .from(users)
      .where(eq(users.id, userId));

    if (!counterUser[0].countUser) {
      logger.error("user data not found");
      throw new APIDataNotFoundError();
    }

    // get role data
    const roleData: Role | undefined = await tx.query.roles.findFirst({
      where: eq(roles.id, payload.roleId),
    });

    if (!roleData) {
      logger.error("role data not found");
      throw new APIDataNotFoundError();
    }

    // if role is not consultant
    if (roleData.name !== "consultant") {
      await tx.delete(usersToTeams).where(eq(usersToTeams.userId, userId));
    }

    // update role
    await tx
      .update(users)
      .set({ roleId: payload.roleId, updatedAt: new Date() })
      .where(eq(users.id, userId));

    const userData: UserWithRoleTeam | undefined =
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

    if (!userData) {
      logger.info("user data not found");
      throw new APIDataNotFoundError();
    }

    return mapperSingleUserWithRoleTeam(userData);
  });
}
