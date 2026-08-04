"use client";

import { useState } from "react";
import { TicketPhaseData } from "lib/db/dto/responses/TicketPhaseData";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import PrimaryButton from "components/forminput/PrimaryButton";
import DangerButton from "components/forminput/DangerButton";

type PhaseItemProps = {
  phase: TicketPhaseData;
  onReload: () => void;
};

export default function PhaseItem({ phase, onReload }: PhaseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(phase.name);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    const nextName = name.trim();
    if (!nextName) return;
    setIsSaving(true);

    const { status } = await HttpGateway.secureHttpPatch(
      `/api/ticket-phases/${phase.id}`,
      JSON.stringify({ name: nextName })
    );

    setIsSaving(false);
    if (status === 200) {
      setIsEditing(false);
      onReload();
    }
  };

  const remove = async () => {
    setIsSaving(true);
    const { status } = await HttpGateway.secureHttpDelete(
      `/api/ticket-phases/${phase.id}`
    );
    setIsSaving(false);
    if (status === 200) {
      onReload();
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-3">
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {phase.name}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <PrimaryButton type="button" isDisabled={isSaving} onClick={save}>
              Save
            </PrimaryButton>
            <PrimaryButton
              type="button"
              isDisabled={isSaving}
              onClick={() => {
                setIsEditing(false);
                setName(phase.name);
              }}
              className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </PrimaryButton>
          </>
        ) : (
          <>
            <PrimaryButton
              type="button"
              isDisabled={isSaving}
              onClick={() => setIsEditing(true)}
              className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Rename
            </PrimaryButton>
            <DangerButton type="button" isDisabled={isSaving} onClick={remove}>
              Delete
            </DangerButton>
          </>
        )}
      </div>
    </div>
  );
}

