"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type AlertModalType = "alert" | "contents" | "info" | "present" | "success";

export interface AlertModalOptions {
  type?: AlertModalType;
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

const ICONS: Record<AlertModalType, { src: string; alt: string }> = {
  alert:    { src: "/icons/modal/alert.png",    alt: "경고" },
  contents: { src: "/icons/modal/contents.png", alt: "내용" },
  info:     { src: "/icons/modal/info.png",     alt: "안내" },
  present:  { src: "/icons/modal/present.png",  alt: "선물" },
  success:  { src: "/icons/modal/success.png",  alt: "완료" },
};

/** description 내 [텍스트] 패턴을 primary 색상으로 강조 렌더링 */
function renderDescription(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[.+\]$/.test(part) ? (
      <span key={i} className="text-[var(--color-primary)] font-medium">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function AlertModal({
  type = "alert",
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

  const icon = ICONS[type];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[380px] rounded-[24px] overflow-hidden bg-[var(--color-border-light)]"
        style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.08)" }}
      >
        {/* Header — 웜 크림 그라디언트 */}
        <div
          className="flex flex-col items-center gap-3 py-4 pl-5 pr-4"
          style={{ background: "var(--gradient-modal-alert-header)" }}
        >
          <Image
            src={icon.src}
            alt={icon.alt}
            width={44}
            height={44}
            className="object-contain"
          />
          <h2 className="text-[18px] font-bold leading-[152%] tracking-[-0.04em] text-[var(--color-text)] text-center">
            {title}
          </h2>
          {description && (
            <p className="text-[14px] font-normal leading-[160%] tracking-[-0.04em] text-center text-[var(--color-modal-desc)] whitespace-pre-line">
              {renderDescription(description)}
            </p>
          )}
        </div>

        {/* Footer — 화이트, 그라디언트 끝(#FFF)과 자연스럽게 이어짐 */}
        <div className="bg-white flex flex-col items-center px-5 py-4 gap-4" style={{ boxShadow: "0px 4px 4px rgba(16, 24, 64, 0.08)" }}>
          <button
            ref={primaryRef}
            type="button"
            onClick={handlePrimary}
            className="w-full h-12 rounded-[30px] text-white text-[16px] font-semibold leading-[150%] tracking-[-0.02em] hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ background: "var(--color-text)" }}
          >
            {primaryLabel}
          </button>

          {secondaryLabel && (
            <button
              type="button"
              onClick={handleSecondary}
              className="text-[14px] font-medium leading-[17px] tracking-[-0.04em] underline text-[var(--color-text-secondary)] hover:opacity-70 transition-opacity"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
