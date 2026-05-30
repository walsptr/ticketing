import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { projects } from "./1756796090_projects";
import { relations } from "drizzle-orm";
import { labeledTickets } from "./1756799422_labeled_tickets";

export const ticketLabels = pgTable("ticket_labels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ticketLabelsRelations = relations(
  ticketLabels,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [ticketLabels.projectId],
      references: [projects.id],
    }),
    labeledTickets: many(labeledTickets),
  })
);
