"use client";

import { UserData } from "lib/db/dto/responses/UserData";
import { Role, Team } from "lib/db/models";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { useEffect, useMemo, useState } from "react";
import UserTable from "./_components/UserTable";
import { CircleX } from "lucide-react";
import { toast } from "sonner";
import { useUserLogIn } from "hooks/context/UserLogInContext";

export default function ManageUserPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [query, setQuery] = useState("");
  const [isLoadingIds, setIsLoadingIds] = useState<Set<string>>(new Set());
  const { userLogIn, changeUserLogIn } = useUserLogIn();

  // searching user
  const norm = (s?: string | null) => (s ?? "").toLowerCase();
  const filteredUsers = useMemo(() => {
    const q = norm(query);
    if (!q) return users;

    return users.filter((user) => {
      const name = norm(user.name);
      const email = norm(user.email);

      return name.includes(q) || email.includes(q);
    });
  }, [users, query]);

  const getUsers = async () => {
    const { status, data } = await HttpGateway.secureHttpGet("/api/users");
    if (status === 200) setUsers(data.data);
  };

  const getRoles = async () => {
    const { status, data } = await HttpGateway.secureHttpGet("/api/roles");
    if (status === 200) setRoles(data.data);
  };

  const getTeams = async () => {
    const { status, data } = await HttpGateway.secureHttpGet("/api/teams");
    if (status === 200) setTeams(data.data);
  };

  // replace updated user
  const replaceUserById = (arr: UserData[], updated: UserData) => {
    const idx = arr.findIndex((user) => user.id === updated.id);
    if (idx < 0) return arr;

    const next = arr.slice();
    next[idx] = updated;
    return next;
  };

  const updateStatus = async (userId: string) => {
    // add loading by userId
    setIsLoadingIds((prev) => {
      const n = new Set(prev);
      n.add(userId);
      return n;
    });

    try {
      const { status, data } = await HttpGateway.secureHttpPatch(
        `/api/users/${userId}/status`
      );

      if (status === 200) {
        // update list users
        toast.success(data.message);
        setUsers((prev) => replaceUserById(prev, data.data));

        // change user logged in
        if (data.data.id === userLogIn?.id) {
          sessionStorage.setItem("user", JSON.stringify(data.data));
          changeUserLogIn();
        }
      }
    } finally {
      // remove loading userId
      setIsLoadingIds((prev) => {
        const n = new Set(prev);
        n.delete(userId);
        return n;
      });
    }
  };

  useEffect(() => {
    getUsers();
    getRoles();
    getTeams();
  }, []);

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
        <button
          type="button"
          className="w-32 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-300 flex items-center justify-center"
        >
          Add User
        </button>
        <div className="dark:bg-gray-900">
          <div className="relative py-4 pe-4">
            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 m-4 text-gray-500 dark:text-gray-400"
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
              onChange={(e) => setQuery(e.target.value)}
              id="table-search"
              className="w-80 block py-2 ps-10 rounded-lg border text-sm bg-white transition dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Search for items"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-7 top-6 text-gray-500 dark:text-gray-300"
              >
                <CircleX />
              </button>
            )}
          </div>
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        roles={roles}
        teams={teams}
        onUpdateStatus={updateStatus}
        isLoadingIds={isLoadingIds}
      />
    </div>
  );
}
