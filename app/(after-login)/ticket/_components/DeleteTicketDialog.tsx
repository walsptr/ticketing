"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import DangerButton from "components/forminput/DangerButton";
import PrimaryButton from "components/forminput/PrimaryButton";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { TicketCardData } from "lib/db/dto/responses/TicketCardData";

type DeleteTicketDialogProps = {
  isOpen: boolean;
  projectId: string;
  ticket?: TicketCardData | null;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteTicketDialog({
  isOpen,
  projectId,
  ticket,
  onClose,
  onDeleted,
}: DeleteTicketDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !ticket) return null;

  const remove = async () => {
    if (!projectId) return;

    setIsDeleting(true);
    const response = await HttpGateway.secureHttpDelete(
      `/api/tickets/${ticket.id}?projectId=${encodeURIComponent(projectId)}`
    );
    setIsDeleting(false);

    if (response.status === 200) {
      toast.success(response.data.message);
      onDeleted();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <X size={16} />
          <span className="sr-only">Close modal</span>
        </button>

        <div className="space-y-4 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
            <X size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete Ticket
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Ticket <span className="font-medium">{ticket.title}</span> akan
              dihapus permanen. Aksi ini tidak bisa dibatalkan.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <PrimaryButton
              type="button"
              isDisabled={isDeleting}
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </PrimaryButton>
            <DangerButton
              type="button"
              isDisabled={isDeleting}
              onClick={remove}
              className="px-4 py-3"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </DangerButton>
          </div>
        </div>
      </div>
    </div>
  );
}
