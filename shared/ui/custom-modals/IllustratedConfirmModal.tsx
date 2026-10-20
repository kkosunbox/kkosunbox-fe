"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import ModalShell from "../modal/ModalShell";

export type ConfirmModalIllustration = "checklist" | "restart" | "warning" | "withdraw" | "review";

/**
 * Figma 기준 본문 하단(154px) ~ 버튼 상단(307px) 153px 영역 안 일러스트 배치.
 * 126×126 아이콘은 본문 아래 7px, 139×131 아이콘은 4px 에서 시작한다.
 */
const ILLUSTRATIONS: Record<ConfirmModalIllustration, { src: string; width: number; height: number; className: string }> = {
  checklist: { src: "/images/modal/confirm-checklist.webp", width: 126, height: 126, className: "pt-[7px]" },
  restart: { src: "/images/modal/confirm-restart.webp", width: 126, height: 126, className: "pt-[7px]" },
  warning: { src: "/images/modal/confirm-warning.webp", width: 139, height: 131, className: "pt-1" },
  withdraw: { src: "/images/modal/confirm-withdraw.webp", width: 139, height: 131, className: "pt-1" },
  review: { src: "/images/modal/confirm-review.webp", width: 139, height: 131, className: "pt-1" },
};

interface Props {
  onClose: () => void;
  illustration: ConfirmModalIllustration;
  /** 강조 span 은 호출부에서 accent 토큰 색으로 감싼다 */
  title: ReactNode;
  description: ReactNode;
  /** 버튼 배경 — CSS 변수 (예: "var(--color-modal-warning)") */
  accentColor: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

export default function IllustratedConfirmModal({
  onClose,
  illustration,
  title,
  description,
  accentColor,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  const image = ILLUSTRATIONS[illustration];

  return (
    <ModalShell onClose={onClose}>
      {/* Card — 368px, radius 24, pt 40 / pb 24 */}
      <div
        className="relative w-full max-w-[368px] rounded-[24px] bg-white pt-10 pb-6"
        style={{ boxShadow: "var(--shadow-modal-confirm)" }}
      >
        {/* Close button — top 24 / right 24 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-6 right-6 flex items-center justify-center w-6 h-6 hover:opacity-70 transition-opacity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Text — left 40 */}
        <div className="pl-10 pr-6 break-keep">
          <h2 className="text-[24px] font-bold leading-[1.2] tracking-[-0.04em] text-black">
            {title}
          </h2>
          <p className="mt-3 text-[14px] font-medium leading-[1.6] tracking-[-0.04em] text-[var(--color-modal-body)]">
            {description}
          </p>
        </div>

        {/* Illustration area — 153px */}
        <div className={`h-[153px] ${image.className}`}>
          <Image
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            quality={HIGH_IMAGE_QUALITY}
            loading="eager"
            className="mx-auto"
            style={{ width: image.width, height: image.height }}
          />
        </div>

        {/* Actions — left/right 24 */}
        <div className="px-6 flex flex-col items-center">
          <button
            type="button"
            onClick={onPrimary}
            className="w-full h-12 rounded-[8px] text-[16px] font-semibold leading-[1.5] tracking-[-0.02em] text-white hover:opacity-90 transition-opacity"
            style={{ background: accentColor }}
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={onSecondary}
            className="mt-4 text-[13px] font-medium leading-[16px] tracking-[-0.04em] text-[var(--color-modal-link)] underline hover:opacity-70 transition-opacity"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
