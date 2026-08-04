"use client";

import { ManageProjectData } from "lib/db/dto/responses/ManageProjectData";

type ProjectTableProps = {
  projects: ManageProjectData[];
  canManage: boolean;
  onEdit: (_project: ManageProjectData) => void;
  onMembers: (_project: ManageProjectData) => void;
  onDelete: (_project: ManageProjectData) => void;
};

export default function ProjectTable({
  projects,
  canManage,
  onEdit,
  onMembers,
  onDelete,
}: ProjectTableProps) {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Project
            </th>
            <th scope="col" className="px-6 py-3">
              Slug
            </th>
            <th scope="col" className="px-6 py-3">
              Team
            </th>
            <th scope="col" className="px-6 py-3">
              Consultants
            </th>
            <th scope="col" className="px-6 py-3">
              Description
            </th>
            {canManage ? (
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-gray-200 odd:bg-white even:bg-gray-50 dark:border-gray-700 dark:odd:bg-gray-900 dark:even:bg-gray-800"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
                >
                  <div>
                    <p>{project.name}</p>
                    <p className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                      Created by {project.createdByName ?? "-"}
                    </p>
                  </div>
                </th>
                <td className="px-6 py-4">{project.slug}</td>
                <td className="px-6 py-4">{project.teamName ?? "-"}</td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p>{project.members.length} consultant</p>
                    {project.members.length > 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {project.members.map((member) => member.name).join(", ")}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada consultant</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="max-w-sm whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                    {project.description || "-"}
                  </p>
                </td>
                {canManage ? (
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(project)}
                        className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onMembers(project)}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      >
                        Members
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(project)}
                        className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))
          ) : (
            <tr className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              <td
                className="px-6 py-8 text-center font-medium text-gray-900 dark:text-white"
                colSpan={canManage ? 6 : 5}
              >
                Data project belum tersedia.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
