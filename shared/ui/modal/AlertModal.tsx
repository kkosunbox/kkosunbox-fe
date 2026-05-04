"use client";

import { useEffect, useRef } from "react";

export interface AlertModalOptions {
  title: string;
  description?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

interface Props extends AlertModalOptions {
  onClose: () => void;
}

export default function AlertModal({
  title,
  description,
  primaryLabel = "확인",
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: Props) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  function handlePrimary() {
    onPrimary?.();
    onClose();
  }

  function handleSecondary() {
    onSecondary?.();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Card — 피그마 확인 모달(라운드 40, 넉넉한 여백) */}
      <div className="relative z-10 w-full max-w-[320px] md:max-w-[388px] rounded-[40px] bg-white px-8 pt-10 pb-8 flex flex-col items-center">
        {/* Title */}
        <h2 className="max-md:text-subtitle-16-sb md:text-subtitle-18-sb text-[var(--color-text)] text-center">
          {title}
        </h2>

        {/* Description — 제목 대비 +12px 추가 간격 (기존 12px → 24px) */}
        {description && (
          <p className="mt-6 max-md:text-body-13-r md:text-body-14-r text-[var(--color-text-secondary)] text-center whitespace-pre-line">
            {description}
          </p>
        )}

        {/* Primary button */}
        <button
          ref={primaryRef}
          type="button"
          onClick={handlePrimary}
          className="mt-7 w-full h-[48px] rounded-[30px] max-md:text-subtitle-14-sb md:text-subtitle-16-sb text-white hover:opacity-90 active:opacity-80 transition-opacity"
          style={{ background: "var(--color-accent)" }}
        >
          {primaryLabel}
        </button>

        {/* Secondary action */}
        {secondaryLabel && (
          <button
            type="button"
            onClick={handleSecondary}
            className="mt-4 max-md:text-body-13-m md:text-body-14-m text-[var(--color-text-secondary)] underline hover:opacity-70 transition-opacity"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
