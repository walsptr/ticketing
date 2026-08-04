"use client";

import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { TicketPhaseData } from "lib/db/dto/responses/TicketPhaseData";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import PrimaryButton from "components/forminput/PrimaryButton";
import PhaseItem from "./PhaseItem";

type PhaseListProps = {
  projectId: string;
  phases: TicketPhaseData[];
  newPhaseName: string;
  setNewPhaseName: (_value: string) => void;
  isLoading: boolean;
  onReload: () => void;
  onSetPhases: (_phases: TicketPhaseData[]) => void;
};

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function PhaseList({
  projectId,
  phases,
  newPhaseName,
  setNewPhaseName,
  isLoading,
  onReload,
  onSetPhases,
}: PhaseListProps) {
  const createPhase = async () => {
    if (!projectId) return;
    const name = newPhaseName.trim();
    if (!name) return;

    const { status } = await HttpGateway.secureHttpPost(
      "/api/ticket-phases",
      JSON.stringify({ projectId, name })
    );

    if (status === 200) {
      setNewPhaseName("");
      onReload();
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;
    if (!projectId) return;

    const prev = phases;
    const next = reorder(phases, source.index, destination.index);
    onSetPhases(next);

    const { status } = await HttpGateway.secureHttpPost(
      "/api/ticket-phases/reorder",
      JSON.stringify({
        projectId,
        phaseIds: next.map((p) => p.id),
      })
    );

    if (status !== 200) {
      onSetPhases(prev);
    } else {
      onReload();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-sm">
          <input
            className="w-full px-4 py-3 rounded-lg border text-sm bg-gray-100 transition dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={newPhaseName}
            onChange={(e) => setNewPhaseName(e.target.value)}
            placeholder="e.g. QA Review"
          />
        </div>
        <div className="pt-6">
          <PrimaryButton type="button" isDisabled={isLoading || !newPhaseName.trim()} onClick={createPhase}>
            Add
          </PrimaryButton>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="phases">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {phases.map((phase, index) => (
                <Draggable key={phase.id} draggableId={phase.id} index={index}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                    >
                      <PhaseItem phase={phase} onReload={onReload} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
