"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-violet-100 bg-violet-50/60 px-4 py-3 dark:border-violet-900/40 dark:bg-violet-900/10">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-0 motion-reduce:animate-none motion-reduce:opacity-100" />
        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-150 motion-reduce:animate-none motion-reduce:opacity-100" />
        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-300 motion-reduce:animate-none motion-reduce:opacity-100" />
      </span>
      <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
        AI Support sedang menyusun balasan...
      </span>
    </div>
  );
}
