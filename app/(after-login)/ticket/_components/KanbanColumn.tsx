"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TicketPhaseData } from "lib/db/dto/responses/TicketPhaseData";
import { TicketCardData } from "lib/db/dto/responses/TicketCardData";
import TicketCard from "./TicketCard";

type KanbanColumnProps = {
  projectId: string;
  phase: TicketPhaseData;
  tickets: TicketCardData[];
  onEditTicket: (_ticket: TicketCardData) => void;
  onDeleteTicket: (_ticket: TicketCardData) => void;
};

export default function KanbanColumn({
  projectId,
  phase,
  tickets,
  onEditTicket,
  onDeleteTicket,
}: KanbanColumnProps) {
  return (
    <div className="w-80 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {phase.name}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {tickets.length}
        </span>
      </div>

      <Droppable droppableId={phase.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={[
              "min-h-[120px] rounded-md p-2 border",
              snapshot.isDraggingOver
                ? "border-blue-500 bg-blue-50 dark:bg-gray-900"
                : "border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700",
            ].join(" ")}
          >
            <div className="space-y-2">
              {tickets.map((ticket, index) => (
                <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                    >
                      <TicketCard
                        ticket={ticket}
                        projectId={projectId}
                        dragHandleProps={dragProvided.dragHandleProps}
                        onEdit={onEditTicket}
                        onDelete={onDeleteTicket}
                      />
                    </div>
                  )}
                </Draggable>
              ))}

              {tickets.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-300 px-3 py-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Belum ada ticket di phase ini.
                </div>
              ) : null}

              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
