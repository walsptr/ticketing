import { TicketCardData } from "./TicketCardData";
import { TicketPhaseData } from "./TicketPhaseData";

export type TicketBoardData = {
  phases: TicketPhaseData[];
  tickets: TicketCardData[];
};

