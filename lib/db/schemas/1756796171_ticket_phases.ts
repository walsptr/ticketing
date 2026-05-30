import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { projects } from "./1756796090_projects";
import { relations } from "drizzle-orm";
import { tickets } from "./1756798749_tickets";

export const ticketPhases = pgTable("ticket_phases", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  order: integer("order").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ticketPhasesRelations = relations(
  ticketPhases,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [ticketPhases.projectId],
      references: [projects.id],
    }),
    tickets: many(tickets),
  })
);
