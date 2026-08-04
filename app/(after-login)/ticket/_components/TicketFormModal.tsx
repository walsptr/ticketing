"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { toast } from "sonner";
import PrimaryButton from "components/forminput/PrimaryButton";
import DangerButton from "components/forminput/DangerButton";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { TicketPhaseData } from "lib/db/dto/responses/TicketPhaseData";
import { TicketCardData } from "lib/db/dto/responses/TicketCardData";

type TicketFormModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  projectId: string;
  phases: TicketPhaseData[];
  ticket?: TicketCardData | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleteClick?: (_ticket: TicketCardData) => void;
};

function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export default function TicketFormModal({
  isOpen,
  mode,
  projectId,
  phases,
  ticket,
  onClose,
  onSaved,
  onDeleteClick,
}: TicketFormModalProps) {
  const isEditMode = mode === "edit" && Boolean(ticket);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(ticket?.title ?? "");
    setDescription(ticket?.description ?? "");
    setPhaseId(ticket?.phaseId ?? phases[0]?.id ?? "");
    setDueDate(toDateInputValue(ticket?.dueDate));
  }, [isOpen, ticket, phases]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSaving, onClose]);

  const titleText = useMemo(() => {
    return isEditMode ? "Edit Ticket" : "New Ticket";
  }, [isEditMode]);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !projectId || !phaseId) return;

    setIsSaving(true);

    const payload = JSON.stringify({
      projectId,
      title: trimmedTitle,
      description: description.trim() || null,
      phaseId,
      dueDate: dueDate || null,
    });

    const response = isEditMode
      ? await HttpGateway.secureHttpPatch(`/api/tickets/${ticket?.id}`, payload)
      : await HttpGateway.secureHttpPost("/api/tickets", payload);

    setIsSaving(false);

    if (response.status === 200) {
      toast.success(response.data.message);
      onSaved();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="absolute right-3 top-3 flex items-center gap-1">
          {isEditMode && ticket ? (
            <Link
              href={`/ticket/${ticket.id}?projectId=${encodeURIComponent(projectId)}`}
              onClick={onClose}
              aria-label="Open full page"
              title="Open full page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              <Maximize2 size={16} />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          >
            <X size={16} />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {titleText}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Isi detail ticket lalu simpan perubahan.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="ticket-title"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Title
              </label>
              <input
                id="ticket-title"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-cyan-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Contoh: Payment gateway timeout"
                maxLength={150}
                disabled={isSaving}
                required
              />
            </div>

            <div>
              <label
                htmlFor="ticket-description"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Description
              </label>
              <textarea
                id="ticket-description"
                className="min-h-32 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-cyan-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Jelaskan kendala yang terjadi"
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ticket-phase"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Phase
                </label>
                <select
                  id="ticket-phase"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-cyan-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={phaseId}
                  onChange={(event) => setPhaseId(event.target.value)}
                  disabled={isSaving}
                  required
                >
                  {phases.map((phase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ticket-due-date"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Due Date
                </label>
                <input
                  id="ticket-due-date"
                  type="date"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-cyan-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
            <div>
              {isEditMode && ticket ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {onDeleteClick ? (
                    <DangerButton
                      type="button"
                      isDisabled={isSaving}
                      onClick={() => onDeleteClick(ticket)}
                    >
                      Delete
                    </DangerButton>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <PrimaryButton
                type="button"
                isDisabled={isSaving}
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                type="submit"
                isDisabled={isSaving || !title.trim() || !phaseId}
              >
                {isSaving
                  ? "Saving..."
                  : isEditMode
                    ? "Save Changes"
                    : "Create Ticket"}
              </PrimaryButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
