export type UpdateTicketPayload = {
  projectId: string;
  title: string;
  description?: string | null;
  phaseId: string;
  dueDate?: string | null;
};
