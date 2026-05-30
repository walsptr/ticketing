import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "../schemas";
import { Role } from "./Role";
import { Team } from "./Team";
import { Project } from "./Project";
import { AssignedToProject } from "./AssignedToProject";
import { UserToTeam } from "./UserToTeam";

// for insert data
export type UserInsert = InferInsertModel<typeof users>;

// for select data
export type User = InferSelectModel<typeof users>;
export type UserWithRole = User & { role: Role | null };
export type UserWithTeam = User & { team: Team | null };
export type UserWithRoleTeam = User & {
  role: Role | null;
  usersToTeams: (UserToTeam & { team: Team })[];
};
export type UserWithProject = User & {
  assignedToProjects: (AssignedToProject & { project: Project })[];
};
