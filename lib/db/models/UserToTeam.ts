import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { usersToTeams } from "../schemas";

// for insert data
export type UserToTeamInsert = InferInsertModel<typeof usersToTeams>;

// for select data
export type UserToTeam = InferSelectModel<typeof usersToTeams>;
export type TeamIds = {
  teamId: string;
};
