import { Role, Team, User } from "lib/db/models";

export type UserData = Omit<User, "password" | "roleId"> & {
  role: Role | null;
  teams: (Team & { isLeader: boolean })[] | null;
};
