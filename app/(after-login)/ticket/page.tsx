"use client";

import { useEffect, useMemo, useState } from "react";
import { useUserLogIn } from "hooks/context/UserLogInContext";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { ProjectData } from "lib/db/dto/responses/ProjectData";
import { TicketBoardData } from "lib/db/dto/responses/TicketBoardData";
import { TicketCardData } from "lib/db/dto/responses/TicketCardData";
import PrimaryButton from "components/forminput/PrimaryButton";
import ProjectSelect from "./_components/ProjectSelect";
import KanbanBoard from "./_components/KanbanBoard";
import TicketFormModal from "./_components/TicketFormModal";
import DeleteTicketDialog from "./_components/DeleteTicketDialog";
import Link from "next/link";

type ColumnsState = Record<string, TicketCardData[]>;

function buildColumns(board: TicketBoardData): ColumnsState {
  const columns: ColumnsState = {};
  for (const phase of board.phases) {
    columns[phase.id] = [];
  }

  for (const ticket of board.tickets) {
    if (!columns[ticket.phaseId]) {
      columns[ticket.phaseId] = [];
    }
    columns[ticket.phaseId].push(ticket);
  }

  for (const phaseId of Object.keys(columns)) {
    columns[phaseId].sort((a, b) => a.order - b.order);
  }

  return columns;
}

function reorderLocal(
  columns: ColumnsState,
  sourcePhaseId: string,
  destPhaseId: string,
  sourceIndex: number,
  destIndex: number
) {
  const nextColumns: ColumnsState = { ...columns };
  const sourceTickets = [...(nextColumns[sourcePhaseId] ?? [])];
  const destTickets =
    sourcePhaseId === destPhaseId
      ? sourceTickets
      : [...(nextColumns[destPhaseId] ?? [])];

  const [moved] = sourceTickets.splice(sourceIndex, 1);
  if (!moved) return columns;

  const boundedIndex = Math.min(Math.max(destIndex, 0), destTickets.length);
  destTickets.splice(boundedIndex, 0, {
    ...moved,
    phaseId: destPhaseId,
  });

  for (let i = 0; i < sourceTickets.length; i++) {
    sourceTickets[i] = { ...sourceTickets[i], order: i + 1 };
  }

  for (let i = 0; i < destTickets.length; i++) {
    destTickets[i] = { ...destTickets[i], order: i + 1 };
  }

  nextColumns[sourcePhaseId] = sourceTickets;
  nextColumns[destPhaseId] = destTickets;
  return nextColumns;
}

export default function MyTicketPage() {
  const { userLogIn } = useUserLogIn();
  const roleName = userLogIn?.role?.name?.toLowerCase() ?? "";

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [board, setBoard] = useState<TicketBoardData>({
    phases: [],
    tickets: [],
  });
  const [columns, setColumns] = useState<ColumnsState>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [activeTicket, setActiveTicket] = useState<TicketCardData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TicketCardData | null>(null);

  const canAccess = useMemo(() => {
    return (
      roleName === "admin" ||
      roleName === "consultant" ||
      roleName === "project coordinator"
    );
  }, [roleName]);

  const canManagePhases = useMemo(() => {
    return roleName === "project coordinator" || roleName === "admin";
  }, [roleName]);

  const hasPhases = board.phases.length > 0;

  const fetchProjects = async () => {
    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpGet("/api/projects/my");
    if (status === 200) {
      const projectData: ProjectData[] = data.data ?? [];
      setProjects(projectData);
      if (projectData.length > 0) {
        setSelectedProjectId((prev) => prev || projectData[0].id);
      } else {
        setSelectedProjectId("");
      }
    }
    setIsLoading(false);
  };

  const fetchBoard = async (projectId: string) => {
    if (!projectId) return;
    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpGet(
      `/api/tickets/board?projectId=${encodeURIComponent(projectId)}`
    );
    if (status === 200) {
      const boardData: TicketBoardData = data.data ?? { phases: [], tickets: [] };
      setBoard(boardData);
      setColumns(buildColumns(boardData));
    }
    setIsLoading(false);
  };

  const reloadBoard = async () => {
    if (!selectedProjectId) return;
    await fetchBoard(selectedProjectId);
  };

  const openCreateModal = () => {
    setActiveTicket(null);
    setFormMode("create");
  };

  const openEditModal = (ticket: TicketCardData) => {
    setActiveTicket(ticket);
    setFormMode("edit");
  };

  const closeFormModal = () => {
    setFormMode(null);
    setActiveTicket(null);
  };

  const openDeleteDialog = (ticket: TicketCardData) => {
    setDeleteTarget(ticket);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  useEffect(() => {
    if (!canAccess) return;
    fetchProjects();
  }, [canAccess]);

  useEffect(() => {
    if (!canAccess) return;
    fetchBoard(selectedProjectId);
  }, [canAccess, selectedProjectId]);

  useEffect(() => {
    closeFormModal();
    closeDeleteDialog();
  }, [selectedProjectId]);

  if (!canAccess) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600">
            Halaman ini hanya untuk admin, consultant, dan project coordinator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <h1 className="text-xl font-semibold">My Ticket</h1>
          <ProjectSelect
            projects={projects}
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            isDisabled={isLoading || projects.length === 0}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PrimaryButton
            type="button"
            isDisabled={isLoading || !selectedProjectId || !hasPhases}
            onClick={openCreateModal}
            className="px-4 py-2"
          >
            New Ticket
          </PrimaryButton>

          {canManagePhases ? (
            <Link
              href="/ticket/phases"
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Manage Phases
            </Link>
          ) : null}
        </div>
      </div>

      {selectedProjectId && !isLoading && !hasPhases ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Project ini belum punya phase ticket, jadi ticket baru belum bisa dibuat.
        </div>
      ) : null}

      <KanbanBoard
        projectId={selectedProjectId}
        phases={board.phases}
        columns={columns}
        isLoading={isLoading}
        onEditTicket={openEditModal}
        onDeleteTicket={openDeleteDialog}
        onMove={async ({ fromPhaseId, toPhaseId, fromIndex, toIndex, ticketId }) => {
          if (!selectedProjectId) return;
          const prevColumns = columns;
          const nextColumns = reorderLocal(
            columns,
            fromPhaseId,
            toPhaseId,
            fromIndex,
            toIndex
          );
          setColumns(nextColumns);

          const { status } = await HttpGateway.secureHttpPost(
            "/api/tickets/move",
            JSON.stringify({
              projectId: selectedProjectId,
              ticketId,
              fromPhaseId,
              toPhaseId,
              fromIndex,
              toIndex,
            })
          );

          if (status !== 200) {
            setColumns(prevColumns);
          }
        }}
      />

      <TicketFormModal
        isOpen={formMode !== null}
        mode={formMode ?? "create"}
        projectId={selectedProjectId}
        phases={board.phases}
        ticket={activeTicket}
        onClose={closeFormModal}
        onSaved={async () => {
          closeFormModal();
          await reloadBoard();
        }}
        onDeleteClick={(ticket) => {
          closeFormModal();
          openDeleteDialog(ticket);
        }}
      />

      <DeleteTicketDialog
        isOpen={Boolean(deleteTarget)}
        projectId={selectedProjectId}
        ticket={deleteTarget}
        onClose={closeDeleteDialog}
        onDeleted={async () => {
          closeDeleteDialog();
          await reloadBoard();
        }}
      />
    </div>
  );
}
