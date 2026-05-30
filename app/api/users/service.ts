import { db } from "config/db";
import { UserData } from "lib/db/dto/responses/UserData";
import { mapperManyUserWithRoleTeam } from "lib/db/mapper/UserToTeam";
import { UserWithRoleTeam } from "lib/db/models";
import { NextRequest } from "next/server";

export async function getUsers(_req: NextRequest): Promise<UserData[]> {
  const usersData: UserWithRoleTeam[] = await db.query.users.findMany({
    with: {
      role: true,
      usersToTeams: {
        with: {
          team: true,
        },
      },
    },
  });

  return mapperManyUserWithRoleTeam(usersData);
}
