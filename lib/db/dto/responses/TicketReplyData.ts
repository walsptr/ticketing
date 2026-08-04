export type TicketReplyAuthorData = {
  id: string;
  name: string;
  email: string;
  roleName: string | null;
};

export type TicketReplyData = {
  id: string;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  author: TicketReplyAuthorData;
  isOwner: boolean;
  isAi: boolean;
  replyToReplyId: string | null;
};
