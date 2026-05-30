import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { ticketReplies } from "../schemas";

// for insert data
export type TicketReplyInsert = InferInsertModel<typeof ticketReplies>;

// for select data
export type TicketReply = InferSelectModel<typeof ticketReplies>;
