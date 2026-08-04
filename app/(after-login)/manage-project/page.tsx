"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleX } from "lucide-react";
import { useUserLogIn } from "hooks/context/UserLogInContext";
import PrimaryButton from "components/forminput/PrimaryButton";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";
import { ProjectMemberData } from "lib/db/dto/responses/ProjectMemberData";
import { Team } from "lib/db/models";
import ProjectTable from "./_components/ProjectTable";
import ProjectFormModal from "./_components/ProjectFormModal";
import ProjectMembersModal from "./_components/ProjectMembersModal";
import DeleteProjectDialog from "./_components/DeleteProjectDialog";

export default function ManageProjectPage() {
  const { userLogIn } = useUserLogIn();
  const roleName = userLogIn?.role?.name?.toLowerCase() ?? "";
  const canManage = roleName === "admin" || roleName === "project coordinator";
  const canView = canManage || roleName === "consultant";

  const [projects, setProjects] = useState<ManageProjectData[]>([]);
  const [consultants, setConsultants] = useState<ProjectMemberData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formTarget, setFormTarget] = useState<ManageProjectData | null>(null);
  const [membersTarget, setMembersTarget] = useState<ManageProjectData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManageProjectData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((project) =>
      [project.name, project.slug, project.description ?? "", project.teamName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [projects, query]);

  const loadProjects = async () => {
    setIsLoading(true);
    const response = await HttpGateway.secureHttpGet("/api/projects");
    if (response.status === 200) {
      setProjects(response.data.data as ManageProjectData[]);
    }
    setIsLoading(false);
  };

  const loadConsultants = async () => {
    const response = await HttpGateway.secureHttpGet("/api/users/consultants");
    if (response.status === 200) {
      setConsultants(response.data.data as ProjectMemberData[]);
    }
  };

  const loadTeams = async () => {
    const response = await HttpGateway.secureHttpGet("/api/teams");
    if (response.status === 200) {
      setTeams(response.data.data as Team[]);
    }
  };

  useEffect(() => {
    if (!canView) return;

    loadProjects();
    if (canManage) {
      loadConsultants();
      loadTeams();
    }
  }, [canView, canManage]);

  if (!canView) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="text-gray-600">
            Halaman ini hanya untuk admin, project coordinator, dan consultant.
          </p>
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setFormTarget(null);
    setIsFormOpen(true);
  };

  const openEdit = (project: ManageProjectData) => {
    setFormTarget(project);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setFormTarget(null);
    setIsFormOpen(false);
  };

  const refreshAfterSave = async () => {
    closeForm();
    setMembersTarget(null);
    setDeleteTarget(null);
    await loadProjects();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Manage Project</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {canManage
              ? "Kelola project dan tentukan consultant yang di-assign ke tiap project."
              : "Daftar project yang Anda miliki dalam mode read-only."}
          </p>
        </div>

        {canManage ? (
          <PrimaryButton
            type="button"
            isDisabled={isLoading}
            onClick={openCreate}
            className="px-4 py-2"
          >
            New Project
          </PrimaryButton>
        ) : null}
      </div>

      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <div className="dark:bg-gray-900">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center">
              <svg
                className="m-4 h-4 w-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 ps-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Search project"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-2 text-gray-500 dark:text-gray-300"
              >
                <CircleX />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <ProjectTable
        projects={filteredProjects}
        canManage={canManage}
        onEdit={openEdit}
        onMembers={setMembersTarget}
        onDelete={setDeleteTarget}
      />

      <ProjectFormModal
        isOpen={isFormOpen}
        canChooseTeam={canManage}
        teams={teams}
        project={formTarget}
        onClose={closeForm}
        onSaved={refreshAfterSave}
      />

      <ProjectMembersModal
        isOpen={Boolean(membersTarget)}
        project={membersTarget}
        consultants={consultants}
        onClose={() => setMembersTarget(null)}
        onSaved={refreshAfterSave}
      />

      <DeleteProjectDialog
        isOpen={Boolean(deleteTarget)}
        project={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={refreshAfterSave}
      />
    </div>
  );
}
