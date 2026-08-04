import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { tickets } from "./1756798749_tickets";
import { users } from "./1756795931_users";
import { relations } from "drizzle-orm";

export const ticketReplies = pgTable(
  "ticket_replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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
    content: text("content").notNull(),
    isAi: boolean("is_ai").notNull().default(false),
    replyToReplyId: uuid("reply_to_reply_id"),
    duration: integer("duration").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    replyToReplyFk: foreignKey({
      columns: [table.replyToReplyId],
      foreignColumns: [table.id],
      name: "ticket_replies_reply_to_reply_id_ticket_replies_id_fk",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  })
);

export const ticketRepliesRelations = relations(ticketReplies, ({ one, many }) => ({
  ticket: one(tickets, {
    fields: [ticketReplies.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketReplies.userId],
    references: [users.id],
  }),
  replyToReply: one(ticketReplies, {
    fields: [ticketReplies.replyToReplyId],
    references: [ticketReplies.id],
    relationName: "ticketReplyParent",
  }),
  aiReplies: many(ticketReplies, {
    relationName: "ticketReplyParent",
  }),
}));
