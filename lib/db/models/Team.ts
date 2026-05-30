import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { teams } from "../schemas";

// for insert data
export type TeamInsert = InferInsertModel<typeof teams>;

// for select data
export type Team = InferSelectModel<typeof teams>;
