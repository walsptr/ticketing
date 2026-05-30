import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { tickets } from "./1756798749_tickets";
import { users } from "./1756795931_users";
import { relations } from "drizzle-orm";

export const assignedToTickets = pgTable(
  "assigned_to_tickets",
  {
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (pgTable) => [primaryKey({ columns: [pgTable.ticketId, pgTable.userId] })]
);

export const assignedToTicketsRelations = relations(
  assignedToTickets,
  ({ one }) => ({
    ticket: one(tickets, {
      fields: [assignedToTickets.ticketId],
      references: [tickets.id],
    }),
    user: one(users, {
      fields: [assignedToTickets.userId],
      references: [users.id],
    }),
  })
);
