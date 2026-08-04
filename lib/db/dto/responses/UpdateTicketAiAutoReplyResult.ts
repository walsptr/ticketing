import { TicketReplyData } from "./TicketReplyData";

export type UpdateTicketAiAutoReplyResult = {
  aiAutoReplyEnabled: boolean;
  aiReply: TicketReplyData | null;
};
