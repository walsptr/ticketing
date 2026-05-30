import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { tickets } from "../schemas";

// for insert data
export type TicketInsert = InferInsertModel<typeof tickets>;

// for select data
export type Ticket = InferSelectModel<typeof tickets>;
