import { pgTable, text, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { users } from "./1756795931_users";
import { relations } from "drizzle-orm";

export const authUsers = pgTable("auth_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  refreshToken: varchar("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  userAgent: text("user_agent"),
  ip: varchar("ip", { length: 20 }),
  deviceId: varchar("device_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const authUsersRelations = relations(authUsers, ({ one }) => ({
  user: one(users, { fields: [authUsers.userId], references: [users.id] }),
}));
