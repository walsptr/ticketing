"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { CreateTicketReplyResult } from "lib/db/dto/responses/CreateTicketReplyResult";
import { TicketDetailPageData } from "lib/db/dto/responses/TicketDetailPageData";
import { TicketReplyData } from "lib/db/dto/responses/TicketReplyData";
import { UpdateTicketAiAutoReplyResult } from "lib/db/dto/responses/UpdateTicketAiAutoReplyResult";
import TicketHeader from "./_components/TicketHeader";
import TicketMetaCard from "./_components/TicketMetaCard";
import TicketDescriptionCard from "./_components/TicketDescriptionCard";
import TicketReplyComposer from "./_components/TicketReplyComposer";
import TicketReplyList from "./_components/TicketReplyList";

const initialDetail: TicketDetailPageData = {
  ticket: {
    id: "",
    title: "",
    description: null,
    referenceCode: "",
    aiAutoReplyEnabled: true,
    dueDate: null,
    createdAt: null,
    updatedAt: null,
  },
  project: {
    id: "",
    name: "",
    slug: "",
  },
  phase: {
    id: "",
    name: "",
  },
  creator: {
    id: "",
    name: "",
    email: "",
    roleName: null,
  },
  replies: [],
};

export default function TicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";
  const ticketId = params.ticketId;

  const [detail, setDetail] = useState<TicketDetailPageData>(initialDetail);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingAi, setIsTogglingAi] = useState(false);

  const boardHref = useMemo(() => {
    return projectId ? `/ticket?projectId=${encodeURIComponent(projectId)}` : "/ticket";
  }, [projectId]);

  const fetchDetail = useCallback(async () => {
    if (!ticketId || !projectId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpGet(
      `/api/tickets/${ticketId}/detail?projectId=${encodeURIComponent(projectId)}`
    );

    if (status === 200) {
      setDetail(data.data as TicketDetailPageData);
    }

    setIsLoading(false);
  }, [ticketId, projectId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const appendReplies = (replies: TicketReplyData[]) => {
    setDetail((prev) => ({
      ...prev,
      replies: [...prev.replies, ...replies].reduce<TicketReplyData[]>((acc, reply) => {
        if (acc.some((item) => item.id === reply.id)) {
          return acc;
        }

        acc.push(reply);
        return acc;
      }, []),
    }));
  };

  const appendReply = (reply: TicketReplyData) => {
    appendReplies([reply]);
  };

  const appendReplyResult = (result: CreateTicketReplyResult) => {
    appendReplies(result.aiReply ? [result.reply, result.aiReply] : [result.reply]);
  };

  const updateReply = (reply: TicketReplyData) => {
    setDetail((prev) => ({
      ...prev,
      replies: prev.replies.map((item) => (item.id === reply.id ? reply : item)),
    }));
  };

  const removeReply = (replyId: string) => {
    setDetail((prev) => ({
      ...prev,
      replies: prev.replies.filter((item) => item.id !== replyId),
    }));
  };

  const toggleAiAutoReply = async () => {
    if (!ticketId || !projectId) return;

    const nextEnabled = !detail.ticket.aiAutoReplyEnabled;
    setIsTogglingAi(true);
    const { status, data } = await HttpGateway.secureHttpPatch(
      `/api/tickets/${ticketId}/ai?projectId=${encodeURIComponent(projectId)}`,
      JSON.stringify({ aiAutoReplyEnabled: nextEnabled })
    );
    setIsTogglingAi(false);

    if (status === 200) {
      toast.success(data.message);
      const result = data.data as UpdateTicketAiAutoReplyResult;
      setDetail((prev) => ({
        ...prev,
        ticket: {
          ...prev.ticket,
          aiAutoReplyEnabled: result.aiAutoReplyEnabled,
        },
      }));

      if (result.aiReply) {
        appendReply(result.aiReply);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600 dark:text-gray-300">
        Loading ticket...
      </div>
    );
  }

  if (!ticketId || !projectId || !detail.ticket.id) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        Ticket tidak ditemukan atau Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TicketHeader
        title={detail.ticket.title}
        referenceCode={detail.ticket.referenceCode}
        projectName={detail.project.name}
        boardHref={boardHref}
        aiAutoReplyEnabled={detail.ticket.aiAutoReplyEnabled}
        isTogglingAi={isTogglingAi}
        onToggleAi={toggleAiAutoReply}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <TicketDescriptionCard description={detail.ticket.description} />
          <TicketReplyComposer
            ticketId={ticketId}
            projectId={projectId}
            onCreated={appendReplyResult}
          />
          <TicketReplyList
            ticketId={ticketId}
            projectId={projectId}
            replies={detail.replies}
            onUpdated={updateReply}
            onDeleted={removeReply}
          />
        </div>

        <div className="space-y-6">
          <TicketMetaCard
            projectName={detail.project.name}
            phaseName={detail.phase.name}
            creatorName={detail.creator.name}
            creatorRole={detail.creator.roleName}
            dueDate={detail.ticket.dueDate}
            createdAt={detail.ticket.createdAt}
            updatedAt={detail.ticket.updatedAt}
            aiAutoReplyEnabled={detail.ticket.aiAutoReplyEnabled}
          />
        </div>
      </div>
    </div>
  );
}
