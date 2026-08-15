"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { Role, Team } from "lib/db/models";

type TeamAssignment = {
  teamId: string;
  isLeader: boolean;
};

export default function UserFormModal({
  open,
  onClose,
  roles,
  teams,
  onCreateSuccess,
}: {
  open: boolean;
  onClose: () => void;
  roles: Role[];
  teams: Team[];
  onCreateSuccess: () => void | Promise<void>;
}) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRoleId("");
    setTeamAssignments([]);
    setIsActive(true);
    setIsSubmitting(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (name.trim().length < 2) {
      newErrors.name = "Nama Lengkap minimal 2 karakter";
    }
    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!email.includes("@")) {
      newErrors.email = "Format email tidak valid";
    }
    if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }
    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Konfirmasi Password tidak sama dengan Password";
    }
    if (!roleId) {
      newErrors.roleId = "Role wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleTeam = (teamId: string) => {
    const exists = teamAssignments.find((t) => t.teamId === teamId);
    if (exists) {
      setTeamAssignments((prev) => prev.filter((t) => t.teamId !== teamId));
    } else {
      setTeamAssignments((prev) => [...prev, { teamId, isLeader: false }]);
    }
  };

  const toggleTeamLeader = (teamId: string) => {
    const exists = teamAssignments.find((t) => t.teamId === teamId);
    if (!exists) return;
    setTeamAssignments((prev) =>
      prev.map((t) =>
        t.teamId === teamId ? { ...t, isLeader: !t.isLeader } : t
      )
    );
  };

  const isTeamSelected = (teamId: string): boolean => {
    return teamAssignments.some((t) => t.teamId === teamId);
  };

  const isTeamLeader = (teamId: string): boolean => {
    return teamAssignments.find((t) => t.teamId === teamId)?.isLeader ?? false;
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const capitalize = (s: string): string => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const isConsultantSelected = (): boolean => {
    return roles.find((r) => r.id === roleId)?.name === "consultant";
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await HttpGateway.secureHttpPost("/api/users", JSON.stringify({
          name,
          email,
          password,
          roleId,
          teamAssignments,
          isActive,
        }));

      if (result && (result.status === 201 || result.status === 200)) {
        toast.success(`User ${name} berhasil ditambahkan`);
        resetForm();
        onClose();
        await onCreateSuccess();
      } else if (result && result.data && result.data.message) {
        toast.error(result.data.message);
      } else {
        toast.error("Gagal menambahkan user");
      }
    } catch (e: any) {
      const msg =
        e?.message ?? e?.data?.message ?? "Terjadi kesalahan server";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal={open ? "true" : undefined}
      className={`fixed inset-0 z-50 justify-center items-center overflow-y-auto overflow-x-hidden h-[calc(100%-1rem)] max-h-full w-full p-4 ${
        open ? "flex" : "hidden"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full bg-white rounded-lg shadow-sm dark:bg-gray-700">
        <button
          onClick={() => {
          resetForm();
          onClose();
        }}
          type="button"
          className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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

        <div className="p-4 md:p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Tambah User Baru
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
              Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-gray-300 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-gray-300 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="Masukkan email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-gray-300 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="Masukkan password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border-gray-300 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="Konfirmasi password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                Role
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full bg-gray-50 border-gray-300 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              >
                <option value="">-- Pilih Role --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name === "project coordinator"
                      ? "Project Coordinator"
                      : capitalize(role.name)}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="mt-1 text-xs text-red-500">{errors.roleId}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
                Assign ke Tim
              </label>
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                ⚠️ Hanya user dengan role Consultant yang bisa di-assign ke tim.
                Jika role lain dipilih, pilihan tim akan diabaikan server.
              </p>
              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between gap-4 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTeamSelected(team.id)}
                        onChange={() => toggleTeam(team.id)}
                        disabled={!isConsultantSelected()}
                        className={!isConsultantSelected()
                          ? "opacity-50 cursor-not-allowed"
                          : ""}
                      />
                      <span
                        className={`text-sm text-gray-900 dark:text-white ${
                          !isConsultantSelected() ? "opacity-50" : ""
                        }`}
                      >
                        {team.name}
                      </span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTeamLeader(team.id)}
                        onChange={() => toggleTeamLeader(team.id)}
                        disabled={
                          !isConsultantSelected() || !isTeamSelected(team.id)
                        }
                        className={`w-4 h-4 rounded border-gray-300 ${
                          !isConsultantSelected() || !isTeamSelected(team.id)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <span
                        className={`text-xs text-violet-600 dark:text-violet-400 ${
                          !isConsultantSelected() || !isTeamSelected(team.id)
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        Leader
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  Status User Aktif?
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Non-aktifkan jika user belum boleh login
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              )}
              Simpan User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
