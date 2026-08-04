import { TicketReplyData } from "./TicketReplyData";

export type TicketDetailPageData = {
  ticket: {
    id: string;
    title: string;
    description: string | null;
    referenceCode: string;
    aiAutoReplyEnabled: boolean;
    dueDate: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  project: {
    id: string;
    name: string;
    slug: string;
  };
  phase: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    roleName: string | null;
  };
  replies: TicketReplyData[];
};
