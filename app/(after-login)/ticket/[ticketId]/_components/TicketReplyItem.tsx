"use client";

import { useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { toast } from "sonner";
import PrimaryButton from "components/forminput/PrimaryButton";
import DangerButton from "components/forminput/DangerButton";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { TicketReplyData } from "lib/db/dto/responses/TicketReplyData";
import TicketReplyEditor from "./TicketReplyEditor";

type TicketReplyItemProps = {
  ticketId: string;
  projectId: string;
  reply: TicketReplyData;
  onUpdated: (_reply: TicketReplyData) => void;
  onDeleted: (_replyId: string) => void;
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketReplyItem({
  ticketId,
  projectId,
  reply,
  onUpdated,
  onDeleted,
}: TicketReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(reply.content);
  const [isLoading, setIsLoading] = useState(false);

  const save = async () => {
    const nextContent = draft.trim();
    if (!nextContent) return;

    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpPatch(
      `/api/tickets/${ticketId}/replies/${reply.id}?projectId=${encodeURIComponent(projectId)}`,
      JSON.stringify({ content: nextContent })
    );
    setIsLoading(false);

    if (status === 200) {
      toast.success(data.message);
      setIsEditing(false);
      onUpdated(data.data as TicketReplyData);
    }
  };

  const remove = async () => {
    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpDelete(
      `/api/tickets/${ticketId}/replies/${reply.id}?projectId=${encodeURIComponent(projectId)}`
    );
    setIsLoading(false);

    if (status === 200) {
      toast.success(data.message);
      onDeleted(reply.id);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {reply.author.name}
            </p>
            {reply.isAi ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-200">
                AI Support
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {reply.author.roleName ? `${reply.author.roleName} · ` : ""}
            {reply.author.email}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Dibuat {formatDate(reply.createdAt)}
            {reply.updatedAt && reply.updatedAt !== reply.createdAt
              ? ` · Diubah ${formatDate(reply.updatedAt)}`
              : ""}
          </p>
          {reply.isAi && reply.replyToReplyId ? (
            <p className="mt-1 text-xs font-medium text-violet-600 dark:text-violet-300">
              Balasan AI untuk reply terbaru pada thread ini.
            </p>
          ) : null}
        </div>

        {reply.isOwner ? (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <PrimaryButton
                  type="button"
                  isDisabled={isLoading}
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
                >
                  Edit
                </PrimaryButton>
                <DangerButton
                  type="button"
                  isDisabled={isLoading}
                  onClick={remove}
                >
                  Delete
                </DangerButton>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3">
            <TicketReplyEditor value={draft} onChange={setDraft} height={180} />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <PrimaryButton
                type="button"
                isDisabled={isLoading}
                onClick={() => {
                  setIsEditing(false);
                  setDraft(reply.content);
                }}
                className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                type="button"
                isDisabled={isLoading || !draft.trim()}
                onClick={save}
              >
                {isLoading ? "Saving..." : "Save Reply"}
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div
            data-color-mode="dark"
            className="dark:[&_.wmde-markdown]:bg-gray-900 dark:[&_.wmde-markdown]:text-gray-100"
          >
            <MarkdownPreview
              source={reply.content}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        )}
      </div>
    </div>
  );
}
