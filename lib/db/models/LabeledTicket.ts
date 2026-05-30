import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { labeledTickets } from "../schemas";

// for insert data
export type LabeledTicketInsert = InferInsertModel<typeof labeledTickets>;

// for select data
export type LabeledTicket = InferSelectModel<typeof labeledTickets>;
