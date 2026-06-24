"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageErrorFallback } from "@/shared/ui";

export default function OrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Order Error]", error);
  }, [error]);

  return (
    <PageErrorFallback
      actions={
        <div className="flex w-full max-w-[360px] flex-col gap-3">
          <button
            onClick={reset}
            className="h-12 w-full rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-16-sb text-white transition-opacity hover:opacity-90"
          >
            새로고침
          </button>
          <Link
            href="/subscribe"
            className="flex h-12 w-full items-center justify-center rounded-[8px] border border-[var(--color-border)] text-body-16-m text-[var(--color-text)] transition-opacity hover:opacity-80"
          >
            구독 플랜으로
          </Link>
        </div>
      }
    />
  );
}
