import { db } from "config/db";
import { logger } from "config/winston";
import { eq } from "drizzle-orm";
import { UserData } from "lib/db/dto/responses/UserData";
import {
  mapperManyUserWithRoleTeam,
  mapperSingleUserWithRoleTeam,
} from "lib/db/mapper/UserToTeam";
import { UserWithRoleTeam } from "lib/db/models";
import { roles, users, usersToTeams } from "lib/db/schemas";
import { APIDataNotFoundError } from "lib/errors/api/APIDataNotFoundError";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { APIServerError } from "lib/errors/api/APIServerError";
import { hashing } from "lib/utils/hashing";
import { NextRequest } from "next/server";

export async function getUsers(_req: NextRequest): Promise<UserData[]> {
  const usersData = (await db.query.users.findMany({
    with: {
      role: true,
      usersToTeams: {
        with: {
          team: true,
        },
      },
    },
  })) as UserWithRoleTeam[];

  return mapperManyUserWithRoleTeam(usersData);
}

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  roleId: string;
  teamAssignments: {
    teamId: string;
    isLeader: boolean;
  }[];
  isActive: boolean;
};

export async function createUser(
  req: NextRequest,
  payload: CreateUserPayload
): Promise<UserData> {
  const headerUserStr = req.headers.get("user");
  if (!headerUserStr) throw new APIResponseError("Unauthorized", 401);
  const headerUser = JSON.parse(headerUserStr);
  if (!headerUser.isActive) {
    throw new APIResponseError("User tidak aktif", 409);
  }

  const role = await db.query.roles.findFirst({
    where: eq(roles.id, payload.roleId),
  });
  if (!role) {
    throw new APIDataNotFoundError("Role tidak ditemukan");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });
  if (existingUser) {
    throw new APIResponseError("Email sudah terdaftar", 409);
  }

  const hashedPassword = await hashing(payload.password);

  try {
    return await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(users)
        .values({
          name: payload.name,
          email: payload.email,
          password: hashedPassword,
          roleId: payload.roleId,
          isActive: payload.isActive ?? true,
          avatarUrl: null,
        })
        .returning();

      if (role.name === "consultant" && payload.teamAssignments?.length > 0) {
        const dedupedMap = new Map<string, boolean>();
        payload.teamAssignments.forEach((item) => {
          const prev = dedupedMap.get(item.teamId) ?? false;
          dedupedMap.set(item.teamId, prev || (item.isLeader ?? false));
        });

        const junctionRows = Array.from(dedupedMap.entries()).map(
          ([teamId, isLeader]) => ({
            userId: insertedUser.id,
            teamId,
            isLeader,
          })
        );

        await tx.insert(usersToTeams).values(junctionRows);
      } else if (role.name !== "consultant" && payload.teamAssignments?.length > 0) {
        logger.warn(
          "User role bukan consultant, team assignments diabaikan",
          {
            roleName: role.name,
            ignoredTeamsCount: payload.teamAssignments.length,
            userId: headerUser.id,
          }
        );
      }

      const userWithRelations = (await tx.query.users.findFirst({
        where: eq(users.id, insertedUser.id),
        with: {
          role: true,
          usersToTeams: {
            with: {
              team: true,
            },
          },
        },
      })) as UserWithRoleTeam | undefined;

      if (!userWithRelations) {
        throw new APIServerError("Gagal query user setelah insert");
      }

      return mapperSingleUserWithRoleTeam(userWithRelations);
    });
  } catch (e: any) {
    if (e.code === "23505") {
      throw new APIResponseError("Email sudah terdaftar", 409);
    }
    throw e;
  }
}
