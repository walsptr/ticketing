import { TicketCardData } from "./TicketCardData";

export type TicketDetailData = TicketCardData & {
  createdBy: string;
  createdAt: string | null;
  updatedAt: string | null;
};
