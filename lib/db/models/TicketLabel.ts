import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { ticketLabels } from "../schemas";

// for insert data
export type TicketLabelInsert = InferInsertModel<typeof ticketLabels>;

// for select data
export type TicketLabel = InferSelectModel<typeof ticketLabels>;
