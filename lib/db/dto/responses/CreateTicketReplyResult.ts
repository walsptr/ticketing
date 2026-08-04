import { TicketReplyData } from "./TicketReplyData";

export type CreateTicketReplyResult = {
  reply: TicketReplyData;
  aiReply: TicketReplyData | null;
};
