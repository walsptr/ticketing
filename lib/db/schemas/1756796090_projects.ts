import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { teams } from "./1756793527_teams";
import { users } from "./1756795931_users";
import { relations } from "drizzle-orm";
import { ticketLabels } from "./1756796349_ticket_labels";
import { ticketPhases } from "./1756796171_ticket_phases";
import { tickets } from "./1756798749_tickets";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id").references(() => teams.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull(),
    description: text("description"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (pgTable) => [uniqueIndex("slug_per_team").on(pgTable.slug, pgTable.teamId)]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  // contributors: many(assignedToProjects),
  teamProject: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  creator: one(users, { fields: [projects.createdBy], references: [users.id] }),
  ticketPhases: many(ticketPhases),
  ticketLabels: many(ticketLabels),
  tickets: many(tickets),
}));
