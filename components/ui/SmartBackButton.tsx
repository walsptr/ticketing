"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type Props = {
  fallbackUrl: string;
  className?: string;
};

export function SmartBackButton({ fallbackUrl, className }: Props) {
  const router = useRouter();
  const hasHistory = useRef(false);

  useEffect(() => {
    hasHistory.current = window.history.length > 1;
  }, []);

  return (
    <button
      onClick={() => {
        if (hasHistory.current) {
          router.back();
        } else {
          router.push(fallbackUrl);
        }
      }}
      className={className || "text-sm text-blue-600 hover:underline"}
    >
      ← Kembali
    </button>
  );
}
