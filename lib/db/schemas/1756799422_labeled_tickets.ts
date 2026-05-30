import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { tickets } from "./1756798749_tickets";
import { ticketLabels } from "./1756796349_ticket_labels";
import { relations } from "drizzle-orm";

export const labeledTickets = pgTable(
  "labeled_tickets",
  {
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    ticketLabelId: uuid("ticket_label_id")
      .notNull()
      .references(() => ticketLabels.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (pgTable) => [
    primaryKey({ columns: [pgTable.ticketId, pgTable.ticketLabelId] }),
  ]
);

export const labeledTicketsRelations = relations(labeledTickets, ({ one }) => ({
  ticket: one(tickets, {
    fields: [labeledTickets.ticketId],
    references: [tickets.id],
  }),
  ticketLabel: one(ticketLabels, {
    fields: [labeledTickets.ticketLabelId],
    references: [ticketLabels.id],
  }),
}));
