import { db } from "config/db";
import { Team } from "lib/db/models";

export async function getTeams(): Promise<Team[]> {
  const teams: Team[] = await db.query.teams.findMany();
  return teams;
}
