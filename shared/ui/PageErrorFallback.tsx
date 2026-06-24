"use client";

import { ReactNode } from "react";

interface PageErrorFallbackProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageErrorFallback({
  title = "정보를 불러올 수 없습니다",
  description = "잠시 후에 다시 시도해주세요.",
  actions,
}: PageErrorFallbackProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-[var(--header-offset)]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-secondary)]">
        <svg width="8" height="28" viewBox="0 0 8 28" fill="none" aria-hidden="true">
          <rect x="0" y="0" width="8" height="20" rx="4" fill="var(--color-btn-dark-warm)" />
          <rect x="0" y="23" width="8" height="5" rx="2.5" fill="var(--color-btn-dark-warm)" />
        </svg>
      </div>
      <p className="text-title-28-sb text-[var(--color-primary)] text-center">
        {title}
      </p>
      <p className="text-body-16-m text-center text-[var(--color-text-secondary)]">
        {description}
      </p>
      {actions}
    </div>
  );
}
