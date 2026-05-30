import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { roles } from "../schemas";

// for insert data
export type RoleInsert = InferInsertModel<typeof roles>;

// for select data
export type Role = InferSelectModel<typeof roles>;
