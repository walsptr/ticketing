import {
  boolean,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./1756795931_users";
import { teams } from "./1756793527_teams";
import { relations } from "drizzle-orm";

export const usersToTeams = pgTable(
  "users_to_teams",
  {
    userId: uuid("user_id")
      .references(() => users.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    teamId: uuid("team_id")
      .references(() => teams.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    isLeader: boolean("is_leader").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (pgTable) => [primaryKey({ columns: [pgTable.userId, pgTable.teamId] })]
);

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(users, { fields: [usersToTeams.userId], references: [users.id] }),
  team: one(teams, { fields: [usersToTeams.teamId], references: [teams.id] }),
}));
