import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { usersToTeams } from "./1758474297_users_to_teams";
import { projects } from "./1756796090_projects";

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  usersToTeams: many(usersToTeams),
  projects: many(projects),
}));
