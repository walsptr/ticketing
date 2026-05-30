"use client";

import { useUserLogIn } from "hooks/context/UserLogInContext";
import { UserData } from "lib/db/dto/responses/UserData";
import { Role, Team } from "lib/db/models";
import { useEffect, useState } from "react";

type _UserTable = {
  users: UserData[];
  roles: Role[];
  teams: Team[];
  onUpdateStatus: (_userId: string) => Promise<void>;
  isLoadingIds: Set<string>;
};

const btn =
  "flex items-center justify-center px-3 h-8 leading-tight border select-none";
const normal =
  "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 " +
  "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";
const active =
  "z-10 text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 " +
  "dark:border-gray-700 dark:bg-gray-700 dark:text-white";
const disabled =
  "text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed " +
  "dark:text-gray-600 dark:border-gray-700 dark:bg-gray-900";

export default function UserTable({
  users,
  roles,
  teams,
  onUpdateStatus,
  isLoadingIds,
}: _UserTable) {
  const { userLogIn } = useUserLogIn();
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);

  // configuration table pagination
  const rowPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(users.length / rowPerPage));
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const usersPager = users.slice(
    (currentPage - 1) * rowPerPage,
    (currentPage - 1) * rowPerPage + rowPerPage
  );

  const startNumberRow = usersPager.length
    ? (currentPage - 1) * rowPerPage + 1
    : 0;
  const endNumberRow = usersPager.length
    ? startNumberRow + usersPager.length - 1
    : 0;

  const getPages = (page: number, total: number, windowSize = 3) => {
    if (total <= windowSize)
      return Array.from({ length: total }, (_, i) => i + 1);
    const start = Math.min(Math.max(page - 1, 1), total - windowSize + 1);
    return Array.from({ length: windowSize }, (_, i) => start + i);
  };

  const changeCurrentPage = (p: number) =>
    setCurrentPage(clamp(p, 1, totalPages));

  const pages = getPages(currentPage, totalPages);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  // modal confirm for deactivate user
  const openConfirm = (userId: string) => setConfirmUserId(userId);
  const closeConfirm = () => setConfirmUserId(null);

  const handleConfirm = async () => {
    if (!confirmUserId) return;
    closeConfirm();
    await onUpdateStatus(confirmUserId);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  return (
    <>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Email
            </th>
            <th scope="col" className="px-6 py-3">
              Role
            </th>
            <th scope="col" className="px-6 py-3">
              Team
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
            {userLogIn?.isActive && (
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (roles.length === 0 || teams.length === 0) ? (
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
              <td
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                colSpan={6}
              >
                Fetching data...
              </td>
            </tr>
          ) : users.length ? (
            usersPager.map((user) => {
              const isLoading = isLoadingIds.has(user.id);
              return (
                <tr
                  key={user.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {user.name} {user.name === userLogIn?.name && " (you)"}
                  </th>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <p>{user.role?.name ?? "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    {user.teams?.length === 0 ? (
                      <p>-</p>
                    ) : (
                      <ol className="ps-5 mt-2 space-y-1 list-decimal list-outside">
                        {user.teams?.map((team) => (
                          <li key={`${user.id}-${team.id}`}>
                            {team.name}
                            {team.isLeader && " (leader)"}
                          </li>
                        ))}
                      </ol>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-3.5 py-1.5 rounded-md dark:bg-green-900 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-3.5 py-1.5 rounded-md dark:bg-red-900 dark:text-red-300">
                        Non Active
                      </span>
                    )}
                  </td>
                  {userLogIn?.isActive && (
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-1.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 me-2"
                      >
                        Info
                      </button>
                      {user.isActive ? (
                        <button
                          type="button"
                          onClick={() => openConfirm(user.id)}
                          disabled={isLoading}
                          className={[
                            "focus:outline-none text-white font-medium rounded-lg text-sm px-3 py-1.5 me-2",
                            isLoading
                              ? "bg-red-300 cursor-not-allowed"
                              : "bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900",
                          ].join(" ")}
                        >
                          {isLoading ? "Processing..." : "Deactivate"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(user.id)}
                          disabled={isLoading}
                          className={[
                            "focus:outline-none text-white font-medium rounded-lg text-sm px-3 py-1.5 me-2",
                            isLoading
                              ? "bg-green-300 cursor-not-allowed"
                              : "bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300  dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800",
                          ].join(" ")}
                        >
                          {isLoading ? "Processing..." : "Activate"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
              <td
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                colSpan={6}
              >
                Data not found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <nav
        className="flex items-center flex-column flex-wrap md:flex-row justify-between p-4"
        aria-label="Table navigation"
      >
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {users.length ? `${startNumberRow}-${endNumberRow}` : "0"}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {users.length}
          </span>
        </span>

        <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
          {" "}
          <li>
            {" "}
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => !isFirst && changeCurrentPage(currentPage - 1)}
              disabled={isFirst}
              className={`ms-0 rounded-s-lg ${btn} ${
                isFirst ? disabled : normal
              }`}
            >
              Previous
            </button>
          </li>
          {pages.map((p) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => changeCurrentPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`${btn} ${p === currentPage ? active : normal}`}
              >
                {p}
              </button>
            </li>
          ))}
          <li>
            {" "}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => !isLast && changeCurrentPage(currentPage + 1)}
              disabled={isLast}
              className={`rounded-e-lg ${btn} ${isLast ? disabled : normal}`}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      {/* modal confirm deactivate user */}
      <div
        role="dialog"
        aria-modal={confirmUserId ? "true" : undefined}
        id="confirm-deactivate-modal"
        className={[
          confirmUserId ? "flex" : "hidden",
          "fixed inset-0 z-50 justify-center items-center overflow-y-auto overflow-x-hidden",
          "h-[calc(100%-1rem)] max-h-full w-full p-4",
        ].join(" ")}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeConfirm();
        }}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            <button
              onClick={() => closeConfirm()}
              type="button"
              className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="confirm-deactivate-modal"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-4 md:p-5 text-center">
              <svg
                className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to deactivate this user?
              </h3>
              <button
                onClick={() => handleConfirm()}
                data-modal-hide="confirm-deactivate-modal"
                type="button"
                className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
              >
                Yes, Sure
              </button>
              <button
                onClick={() => closeConfirm()}
                data-modal-hide="confirm-deactivate-modal"
                type="button"
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
