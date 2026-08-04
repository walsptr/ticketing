"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { TicketPhaseData } from "lib/db/dto/responses/TicketPhaseData";
import { TicketCardData } from "lib/db/dto/responses/TicketCardData";
import KanbanColumn from "./KanbanColumn";

type ColumnsState = Record<string, TicketCardData[]>;

type MovePayload = {
  projectId: string;
  fromPhaseId: string;
  toPhaseId: string;
  fromIndex: number;
  toIndex: number;
  ticketId: string;
};

type KanbanBoardProps = {
  projectId: string;
  phases: TicketPhaseData[];
  columns: ColumnsState;
  isLoading: boolean;
  onMove: (_payload: MovePayload) => Promise<void>;
  onEditTicket: (_ticket: TicketCardData) => void;
  onDeleteTicket: (_ticket: TicketCardData) => void;
};

export default function KanbanBoard({
  projectId,
  phases,
  columns,
  isLoading,
  onMove,
  onEditTicket,
  onDeleteTicket,
}: KanbanBoardProps) {
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (!projectId) return;

    const fromPhaseId = source.droppableId;
    const toPhaseId = destination.droppableId;

    if (
      fromPhaseId === toPhaseId &&
      source.index === destination.index
    ) {
      return;
    }

    await onMove({
      projectId,
      fromPhaseId,
      toPhaseId,
      fromIndex: source.index,
      toIndex: destination.index,
      ticketId: draggableId,
    });
  };

  if (isLoading && phases.length === 0) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-gray-600">
        Pilih project
      </div>
    );
  }

  if (!isLoading && phases.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        Project ini belum punya phase ticket. Tambahkan phase dulu agar ticket bisa dibuat dan dipindahkan.
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {phases.map((phase) => (
          <KanbanColumn
            key={phase.id}
            projectId={projectId}
            phase={phase}
            tickets={columns[phase.id] ?? []}
            onEditTicket={onEditTicket}
            onDeleteTicket={onDeleteTicket}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
