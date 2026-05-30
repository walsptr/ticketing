import { UserData } from "../dto/responses/UserData";
import { UserWithRoleTeam } from "../models";

export function mapperSingleUserWithRoleTeam(
  users: UserWithRoleTeam
): UserData {
  const result: UserData = {
    id: users.id,
    email: users.email,
    name: users.name,
    avatarUrl: users.avatarUrl,
    isActive: users.isActive,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    role: users.role,
    teams: users.usersToTeams?.map((userToTeam) => {
      return { isLeader: userToTeam.isLeader, ...userToTeam.team };
    }),
  };

  return result;
}

export function mapperManyUserWithRoleTeam(
  users: UserWithRoleTeam[]
): UserData[] {
  const result: UserData[] = [];

  for (const user of users) {
    result.push(mapperSingleUserWithRoleTeam(user));
  }

  return result;
}
