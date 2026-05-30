import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { roles } from "./1756793496_roles";
import { relations } from "drizzle-orm";
import { authUsers } from "./1756796035_auth_users";
import { projects } from "./1756796090_projects";
import { tickets } from "./1756798749_tickets";
import { assignedToTickets } from "./1756799570_assigned_to_tickets";
import { ticketReplies } from "./1756799727_ticket_replies";
import { usersToTeams } from "./1758474297_users_to_teams";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").notNull().unique(),
  name: varchar("name").notNull(),
  password: varchar("password").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  roleId: uuid("role_id").references(() => roles.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  usersToTeams: many(usersToTeams),
  auth: many(authUsers),
  projectCreations: many(projects),
  ticketCreations: many(tickets),
  // assignedToProjects: many(assignedToProjects),
  assignedToTickets: many(assignedToTickets),
  ticketReplies: many(ticketReplies),
}));
