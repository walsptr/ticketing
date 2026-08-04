"use client";

import { useEffect, useMemo, useState } from "react";
import { useUserLogIn } from "hooks/context/UserLogInContext";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { ProjectData } from "lib/db/dto/responses/ProjectData";
import { TicketPhaseData } from "lib/db/dto/responses/TicketPhaseData";
import ProjectSelect from "../../ticket/_components/ProjectSelect";
import PhaseList from "./_components/PhaseList";

export default function ManagePhasesPage() {
  const { userLogIn } = useUserLogIn();
  const roleName = userLogIn?.role?.name?.toLowerCase() ?? "";

  const canAccess = useMemo(() => {
    return roleName === "project coordinator" || roleName === "admin";
  }, [roleName]);

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [phases, setPhases] = useState<TicketPhaseData[]>([]);
  const [newPhaseName, setNewPhaseName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpGet("/api/projects/my");
    if (status === 200) {
      const projectData: ProjectData[] = data.data ?? [];
      setProjects(projectData);
      if (projectData.length > 0) {
        setSelectedProjectId((prev) => prev || projectData[0].id);
      }
    }
    setIsLoading(false);
  };

  const fetchPhases = async (projectId: string) => {
    if (!projectId) return;
    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpGet(
      `/api/ticket-phases?projectId=${encodeURIComponent(projectId)}`
    );
    if (status === 200) {
      setPhases(data.data ?? []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!canAccess) return;
    fetchProjects();
  }, [canAccess]);

  useEffect(() => {
    if (!canAccess) return;
    fetchPhases(selectedProjectId);
  }, [canAccess, selectedProjectId]);

  if (!canAccess) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600">Halaman ini hanya untuk project coordinator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <h1 className="text-xl font-semibold">Manage Phases</h1>
          <ProjectSelect
            projects={projects}
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            isDisabled={isLoading || projects.length === 0}
          />
        </div>
      </div>

      <PhaseList
        projectId={selectedProjectId}
        phases={phases}
        newPhaseName={newPhaseName}
        setNewPhaseName={setNewPhaseName}
        isLoading={isLoading}
        onReload={() => fetchPhases(selectedProjectId)}
        onSetPhases={setPhases}
      />
    </div>
  );
}

