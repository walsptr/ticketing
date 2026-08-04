"use client";

type TicketMetaCardProps = {
  projectName: string;
  phaseName: string;
  creatorName: string;
  creatorRole: string | null;
  aiAutoReplyEnabled: boolean;
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function formatDate(value: string | null): string {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type MetaItemProps = {
  label: string;
  value: string;
};

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export default function TicketMetaCard({
  projectName,
  phaseName,
  creatorName,
  creatorRole,
  aiAutoReplyEnabled,
  dueDate,
  createdAt,
  updatedAt,
}: TicketMetaCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Detail Ticket
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MetaItem label="Project" value={projectName} />
        <MetaItem label="Phase" value={phaseName} />
        <MetaItem
          label="AI Status"
          value={aiAutoReplyEnabled ? "AI Auto Reply Aktif" : "Support Takeover Aktif"}
        />
        <MetaItem
          label="Creator"
          value={creatorRole ? `${creatorName} (${creatorRole})` : creatorName}
        />
        <MetaItem label="Due Date" value={formatDate(dueDate)} />
        <MetaItem label="Created At" value={formatDate(createdAt)} />
        <MetaItem label="Updated At" value={formatDate(updatedAt)} />
      </div>
    </div>
  );
}
