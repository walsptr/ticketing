import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { ticketPhases } from "../schemas";

// for insert data
export type TicketPhasesInsert = InferInsertModel<typeof ticketPhases>;

// for select data
export type TicketPhase = InferSelectModel<typeof ticketPhases>;
