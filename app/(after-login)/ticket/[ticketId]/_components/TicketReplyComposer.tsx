"use client";

import { useState } from "react";
import { toast } from "sonner";
import PrimaryButton from "components/forminput/PrimaryButton";
import { CreateTicketReplyResult } from "lib/db/dto/responses/CreateTicketReplyResult";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import TicketReplyEditor from "./TicketReplyEditor";

type TicketReplyComposerProps = {
  ticketId: string;
  projectId: string;
  onCreated: (_result: CreateTicketReplyResult) => void;
};

export default function TicketReplyComposer({
  ticketId,
  projectId,
  onCreated,
}: TicketReplyComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const nextContent = content.trim();
    if (!nextContent) return;

    setIsSubmitting(true);
    const { status, data } = await HttpGateway.secureHttpPost(
      `/api/tickets/${ticketId}/replies?projectId=${encodeURIComponent(projectId)}`,
      JSON.stringify({ content: nextContent })
    );
    setIsSubmitting(false);

    if (status === 200) {
      toast.success(data.message);
      setContent("");
      onCreated(data.data as CreateTicketReplyResult);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tambah Reply
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gunakan markdown untuk mencatat progres, kendala, atau handover.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <TicketReplyEditor value={content} onChange={setContent} />
        <div className="flex justify-end">
          <PrimaryButton
            type="button"
            isDisabled={isSubmitting || !content.trim()}
            onClick={submit}
          >
            {isSubmitting ? "Sending..." : "Post Reply"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
