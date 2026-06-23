"use client";

import { useEffect } from "react";

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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6">
      <p className="text-center text-sm text-gray-500">
        예기치 못한 오류가 발생했습니다.
        <br />
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        다시 시도
      </button>
    </div>
  );
}
