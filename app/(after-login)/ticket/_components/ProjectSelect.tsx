"use client";

import { ProjectData } from "lib/db/dto/responses/ProjectData";

type ProjectSelectProps = {
  projects: ProjectData[];
  value: string;
  onChange: (_projectId: string) => void;
  isDisabled: boolean;
};

export default function ProjectSelect({
  projects,
  value,
  onChange,
  isDisabled,
}: ProjectSelectProps) {
  return (
    <select
      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isDisabled}
    >
      {projects.length === 0 ? (
        <option value="">No project</option>
      ) : null}
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
