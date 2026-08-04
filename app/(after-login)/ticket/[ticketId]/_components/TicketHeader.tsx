"use client";

import Link from "next/link";
import { ArrowLeft, Bot, FolderKanban, ShieldCheck } from "lucide-react";

type TicketHeaderProps = {
  title: string;
  referenceCode: string;
  projectName: string;
  boardHref: string;
  aiAutoReplyEnabled: boolean;
  isTogglingAi: boolean;
  onToggleAi: () => void;
};

export default function TicketHeader({
  title,
  referenceCode,
  projectName,
  boardHref,
  aiAutoReplyEnabled,
  isTogglingAi,
  onToggleAi,
}: TicketHeaderProps) {
  return (
    <div className="space-y-3">
      <Link
        href={boardHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke board</span>
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              <FolderKanban size={14} />
              <span>{projectName}</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ref: {referenceCode}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <div
              className={[
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                aiAutoReplyEnabled
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
              ].join(" ")}
            >
              {aiAutoReplyEnabled ? <Bot size={14} /> : <ShieldCheck size={14} />}
              <span>{aiAutoReplyEnabled ? "AI Auto Reply Aktif" : "Support Takeover Aktif"}</span>
            </div>

            <button
              type="button"
              disabled={isTogglingAi}
              onClick={onToggleAi}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-4",
                isTogglingAi
                  ? "cursor-not-allowed bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  : aiAutoReplyEnabled
                    ? "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300 dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-900"
                    : "bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900",
              ].join(" ")}
            >
              {aiAutoReplyEnabled ? <ShieldCheck size={16} /> : <Bot size={16} />}
              <span>
                {isTogglingAi
                  ? "Memproses..."
                  : aiAutoReplyEnabled
                    ? "Support Takeover"
                    : "AI Takeover"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
