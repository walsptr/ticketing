"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import PrimaryButton from "components/forminput/PrimaryButton";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { Team } from "lib/db/models";

type ProjectFormModalProps = {
  isOpen: boolean;
  canChooseTeam: boolean;
  teams: Team[];
  project?: ManageProjectData | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProjectFormModal({
  isOpen,
  canChooseTeam,
  teams,
  project,
  onClose,
  onSaved,
}: ProjectFormModalProps) {
  const isEditMode = Boolean(project);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setTeamId(project?.teamId ?? teams[0]?.id ?? "");
  }, [isOpen, project, teams]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSaving, onClose]);

  const title = useMemo(() => {
    return isEditMode ? "Edit Project" : "New Project";
  }, [isEditMode]);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = JSON.stringify({
      name: name.trim(),
      description: description.trim() || null,
      ...(!isEditMode ? { teamId } : {}),
    });

    setIsSaving(true);
    const response = isEditMode
      ? await HttpGateway.secureHttpPatch(`/api/projects/${project?.id}`, payload)
      : await HttpGateway.secureHttpPost("/api/projects", payload);
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

        <form onSubmit={submit} className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola nama dan deskripsi project. Slug akan digenerate otomatis dari nama.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="project-name"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Project Name
              </label>
              <input
                id="project-name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-cyan-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Contoh: Payment Revamp"
                maxLength={150}
                disabled={isSaving}
                required
              />
            </div>

            {canChooseTeam && !isEditMode ? (
              <div>
                <label
                  htmlFor="project-team"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Team
                </label>
                <select
                  id="project-team"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-cyan-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={teamId}
                  onChange={(event) => setTeamId(event.target.value)}
                  disabled={isSaving}
                  required
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Description
              </label>
              <textarea
                id="project-description"
                className="min-h-32 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-cyan-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Jelaskan konteks project ini"
                disabled={isSaving}
              />
            </div>
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
            <PrimaryButton
              type="submit"
              isDisabled={isSaving || !name.trim() || (!isEditMode && !teamId)}
            >
              {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Create Project"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
