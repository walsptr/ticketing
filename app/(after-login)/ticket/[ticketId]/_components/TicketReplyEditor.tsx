"use client";

import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type TicketReplyEditorProps = {
  value: string;
  onChange: (_value: string) => void;
  preview?: "edit" | "preview";
  height?: number;
};

export default function TicketReplyEditor({
  value,
  onChange,
  preview = "edit",
  height = 220,
}: TicketReplyEditorProps) {
  return (
    <div data-color-mode="light" className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <MDEditor
        value={value}
        onChange={(next) => onChange(next ?? "")}
        preview={preview}
        height={height}
        className="!border-0"
      />
    </div>
  );
}
