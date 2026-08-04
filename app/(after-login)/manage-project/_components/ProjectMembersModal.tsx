"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import PrimaryButton from "components/forminput/PrimaryButton";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { ProjectMemberData } from "lib/db/dto/responses/ProjectMemberData";

type ProjectMembersModalProps = {
  isOpen: boolean;
  project?: ManageProjectData | null;
  consultants: ProjectMemberData[];
  onClose: () => void;
  onSaved: () => void;
};

export default function ProjectMembersModal({
  isOpen,
  project,
  consultants,
  onClose,
  onSaved,
}: ProjectMembersModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !project) return;
    setSelectedIds(project.members.map((member) => member.id));
  }, [isOpen, project]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSaving, onClose]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  if (!isOpen || !project) return null;

  const toggleConsultant = (consultantId: string) => {
    setSelectedIds((prev) =>
      prev.includes(consultantId)
        ? prev.filter((id) => id !== consultantId)
        : [...prev, consultantId]
    );
  };

  const save = async () => {
    setIsSaving(true);
    const response = await HttpGateway.secureHttpPatch(
      `/api/projects/${project.id}/members`,
      JSON.stringify({
        consultantIds: selectedIds,
      })
    );
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
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <X size={16} />
          <span className="sr-only">Close modal</span>
        </button>

        <div className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Project Members
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pilih consultant yang akan di-assign ke project{" "}
              <span className="font-medium">{project.name}</span>.
            </p>
          </div>

          <div className="max-h-[50vh] space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            {consultants.length > 0 ? (
              consultants.map((consultant) => {
                const checked = selectedSet.has(consultant.id);
                return (
                  <label
                    key={consultant.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleConsultant(consultant.id)}
                      disabled={isSaving}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {consultant.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {consultant.email}
                      </p>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                Belum ada consultant yang tersedia.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end dark:border-gray-700">
            <PrimaryButton
              type="button"
              isDisabled={isSaving}
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton type="button" isDisabled={isSaving} onClick={save}>
              {isSaving ? "Saving..." : "Save Members"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
