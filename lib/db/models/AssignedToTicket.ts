import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { assignedToTickets } from "../schemas";

// for insert data
export type AssignedToTicketInsert = InferInsertModel<typeof assignedToTickets>;

// for select data
export type AssignedToTicket = InferSelectModel<typeof assignedToTickets>;
