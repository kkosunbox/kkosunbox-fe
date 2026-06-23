"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Text } from "@/shared/ui";

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
    <div className="flex flex-1 flex-col items-center justify-center gap-5 pt-[var(--header-offset)]">
      <Text variant="body-16-r" className="text-center text-[var(--color-text-muted)]">
        주문 정보를 불러오지 못했습니다.
        <br />
        잠시 후 다시 시도해 주세요.
      </Text>
      <div className="flex items-center gap-3">
        <Link
          href="/subscribe"
          className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[var(--color-border)] px-5 text-body-14-sb text-[var(--color-text)] transition-opacity hover:opacity-80"
        >
          구독 플랜으로
        </Link>
        <button
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 text-body-14-sb text-white transition-opacity hover:opacity-90"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
