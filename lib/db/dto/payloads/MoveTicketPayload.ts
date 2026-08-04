export type MoveTicketPayload = {
  projectId: string;
  ticketId: string;
  fromPhaseId: string;
  toPhaseId: string;
  fromIndex: number;
  toIndex: number;
};

