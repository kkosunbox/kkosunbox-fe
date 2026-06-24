"use client";

import { useEffect } from "react";
import { PageErrorFallback } from "@/shared/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col">
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
    </div>
  );
}
