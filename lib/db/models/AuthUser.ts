import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { authUsers } from "../schemas";

// for insert data
export type AuthUserInsert = InferInsertModel<typeof authUsers>;

// for select data
export type AuthUser = InferSelectModel<typeof authUsers>;
