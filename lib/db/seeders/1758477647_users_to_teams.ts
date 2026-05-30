import { db } from "../../../config/db";
import { teams, users, usersToTeams } from "../schemas";
import { notInArray } from "drizzle-orm";
import { Team, User, UserToTeamInsert } from "../models";

export async function up() {
  const usersData: User[] = await db.query.users.findMany({
    where: notInArray(users.name, ["Admin", "Dul"]),
  });
  const teamsData: Team[] = await db.select().from(teams);
  const data: UserToTeamInsert[] = [];

  for (const user of usersData) {
    switch (user.name) {
      case "Iqbal":
        data.push({
          userId: user.id,
          teamId: teamsData.find((team) => team.name === "DevOps")?.id ?? "",
        });
        break;
      case "Faaiq":
        data.push({
          userId: user.id,
          teamId: teamsData.find((team) => team.name === "DevOps")?.id ?? "",
        });
        break;
      case "Mamat":
        data.push({
          userId: user.id,
          teamId: teamsData.find((team) => team.name === "Cloud")?.id ?? "",
        });
        break;
      case "Imboy":
        data.push({
          userId: user.id,
          teamId: teamsData.find((team) => team.name === "DevOps")?.id ?? "",
        });
        data.push({
          userId: user.id,
          teamId: teamsData.find((team) => team.name === "Cloud")?.id ?? "",
        });
        break;
      case "Trias":
        data.push({
          userId: user.id,
          teamId: teamsData.find((team) => team.name === "Cloud")?.id ?? "",
        });
        break;
      case "William TP":
        data.push({
          userId: user.id,
          teamId: teamsData.find((team) => team.name === "DevOps")?.id ?? "",
          isLeader: true,
        });
        break;
      case "Chikam":
        data.push({
          userId: user.id,
          teamId: teamsData.find((team) => team.name === "Cloud")?.id ?? "",
          isLeader: true,
        });
        break;
    }
  }

  await db.insert(usersToTeams).values(data);
}

export async function down() {
  await db.delete(usersToTeams);
}
