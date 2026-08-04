"use client";

import { TicketReplyData } from "lib/db/dto/responses/TicketReplyData";
import TicketReplyItem from "./TicketReplyItem";

type TicketReplyListProps = {
  ticketId: string;
  projectId: string;
  replies: TicketReplyData[];
  onUpdated: (_reply: TicketReplyData) => void;
  onDeleted: (_replyId: string) => void;
};

export default function TicketReplyList({
  ticketId,
  projectId,
  replies,
  onUpdated,
  onDeleted,
}: TicketReplyListProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Timeline Reply
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Riwayat diskusi dan progres pada ticket ini.
          </p>
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          {replies.length} reply
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {replies.length > 0 ? (
          replies.map((reply) => (
            <TicketReplyItem
              key={reply.id}
              ticketId={ticketId}
              projectId={projectId}
              reply={reply}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            Belum ada reply. Mulai catat progres atau diskusi pertama pada ticket ini.
          </div>
        )}
      </div>
    </div>
  );
}
