import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { projects } from "../schemas";

// for insert data
export type ProjectInsert = InferInsertModel<typeof projects>;

// for select data
export type Project = InferSelectModel<typeof projects>;
