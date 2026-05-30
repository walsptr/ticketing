import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "./1756796090_projects";
import { users } from "./1756795931_users";
import { relations } from "drizzle-orm";

// ini hanya untuk assign project seperti di oli, bukan untuk assign project di ticketnig
// setiap anggota tim bisa saja berkontribusi di project tim tersebut
export const assignedToProjects = pgTable(
  "assigned_to_projects",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, {
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
  (pgTable) => [
    primaryKey({
      columns: [pgTable.projectId, pgTable.userId],
    }),
  ]
);

export const assignedToProjectsRelations = relations(
  assignedToProjects,
  ({ one }) => ({
    project: one(projects, {
      fields: [assignedToProjects.projectId],
      references: [projects.id],
    }),
    user: one(users, {
      fields: [assignedToProjects.userId],
      references: [users.id],
    }),
  })
);
