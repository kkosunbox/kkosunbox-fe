"use client";

import { useEffect } from "react";
import { PageErrorFallback } from "@/shared/ui";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Main Error]", error);
  }, [error]);

  return (
    <PageErrorFallback
      actions={
        <button
          onClick={reset}
          className="h-12 w-full max-w-[360px] rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-16-sb text-white transition-opacity hover:opacity-90"
        >
          새로고침
        </button>
      }
    />
  );
}
