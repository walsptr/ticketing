"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";

type TicketDescriptionCardProps = {
  description: string | null;
};

export default function TicketDescriptionCard({
  description,
}: TicketDescriptionCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Description
      </h2>

      <div className="mt-4">
        {description?.trim() ? (
          <div
            data-color-mode="dark"
            className="dark:[&_.wmde-markdown]:bg-gray-900 dark:[&_.wmde-markdown]:text-gray-100"
          >
            <MarkdownPreview
              source={description}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            Ticket ini belum memiliki description.
          </div>
        )}
      </div>
    </div>
  );
}
