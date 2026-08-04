"use client";

import Link from "next/link";
import { CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { TicketCardData } from "lib/db/dto/responses/TicketCardData";

type TicketCardProps = {
  ticket: TicketCardData;
  projectId: string;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onEdit: (_ticket: TicketCardData) => void;
  onDelete: (_ticket: TicketCardData) => void;
};

function formatDueDate(value: string | null): string | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TicketCard({
  ticket,
  projectId,
  dragHandleProps,
  onEdit,
  onDelete,
}: TicketCardProps) {
  const dueDateLabel = formatDueDate(ticket.dueDate);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(ticket)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(ticket);
        }
      }}
      className="rounded-md border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-300 hover:shadow dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {ticket.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {ticket.referenceCode}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Drag ticket"
            {...dragHandleProps}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          >
            <GripVertical size={16} />
          </button>
          <button
            type="button"
            aria-label="Edit ticket"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(ticket);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-300"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete ticket"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(ticket);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-red-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-300"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {ticket.description ? (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
          {ticket.description}
        </p>
      ) : null}

      {dueDateLabel ? (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
          <CalendarDays size={12} />
          <span>Due {dueDateLabel}</span>
        </div>
      ) : null}

      <div className="mt-3 flex justify-end">
        <Link
          href={`/ticket/${ticket.id}?projectId=${encodeURIComponent(projectId)}`}
          onClick={(event) => event.stopPropagation()}
          className="text-xs font-semibold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
        >
          Open full page
        </Link>
      </div>
    </div>
  );
}
