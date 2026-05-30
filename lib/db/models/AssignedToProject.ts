import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { assignedToProjects } from "../schemas";

// for insert data
export type AssignedToProjectInsert = InferInsertModel<
  typeof assignedToProjects
>;

// for select data
export type AssignedToProject = InferSelectModel<typeof assignedToProjects>;
