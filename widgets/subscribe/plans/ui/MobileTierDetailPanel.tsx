"use client";

import {
  COMPARE_PACKAGES,
  tierFromSubscriptionPlan,
} from "./packageData";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";

function HeartIcon({ filled }: { filled: boolean }) {
  const color = filled ? "var(--color-primary)" : "var(--color-text-muted)";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.45067 13.9082L11.4033 20.4395C11.6428 20.6644 11.7625 20.7769 11.9037 20.8046C11.9673 20.8171 12.0327 20.8171 12.0963 20.8046C12.2375 20.7769 12.3572 20.6644 12.5967 20.4395L19.5493 13.9082C21.5055 12.0706 21.743 9.0466 20.0978 6.92607L19.7885 6.52734C17.8203 3.99058 13.8696 4.41601 12.4867 7.31365C12.2913 7.72296 11.7087 7.72296 11.5133 7.31365C10.1304 4.41601 6.17972 3.99058 4.21154 6.52735L3.90219 6.92607C2.25695 9.0466 2.4945 12.0706 4.45067 13.9082Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="상세 정보 닫기"
      className="absolute right-7 top-5 z-10 flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M12 2L2 12M2 2L12 12"
          stroke="var(--color-text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

interface Props {
  plan: SubscriptionPlanDto;
  onClose: () => void;
}

export default function MobileTierDetailPanel({ plan, onClose }: Props) {
  const tier = tierFromSubscriptionPlan(plan);
  const pkg = COMPARE_PACKAGES.find((p) => p.tier === tier)!;

  return (
    // 외곽 wrapper — Figma Secondary-BG(#FFF7EF) 위에 × 버튼과 내부 흰 카드 배치
    <div className="relative rounded-[20px] bg-[var(--color-support-faq-surface)] px-7 pt-[62px] pb-8">
      <CloseButton onClick={onClose} />

      {/* 내부 흰 카드 — 기존 상세 콘텐츠를 그대로 감쌈 */}
      <div className="overflow-hidden rounded-[20px] bg-white">
        {/* 헤더 밴드 — 티어 색 20% alpha */}
        <div
          className="flex h-[37px] items-center justify-center"
          style={{ background: pkg.tabActiveBg }}
        >
          <h3 className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
            {pkg.name}
          </h3>
        </div>

        {/* 티어 chip */}
        <div className="flex justify-center pt-6 pb-6">
          <span
            className="inline-flex items-center justify-center rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
            style={{ background: pkg.colorVar }}
          >
            {pkg.tier}
          </span>
        </div>

        {/* 섹션 영역 — 좌우 16px 통일, 각 섹션 상단 구분선 */}
        <div className="px-4">
          {/* Quote — Griun 15px */}
          <div className="border-t border-[var(--color-text-muted)] py-4">
            <p
              className="whitespace-pre-line text-center text-[var(--color-text)]"
              style={{
                fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive',
                fontSize: "15px",
                lineHeight: "19px",
              }}
            >
              &ldquo;{pkg.quote}&rdquo;
            </p>
          </div>

          {/* Contents — 13px / 700 / 티어 색 */}
          <div className="flex flex-col items-center gap-0.5 border-t border-[var(--color-text-muted)] py-4">
            {pkg.contents.map((c) => (
              <p
                key={c}
                className="text-center text-body-13-b leading-[20px] tracking-[-0.02em]"
                style={{ color: pkg.colorVar }}
              >
                {c}
              </p>
            ))}
          </div>

          {/* Special — 13px / 600 */}
          <div className="border-t border-[var(--color-text-muted)] py-4">
            <p className="text-center text-body-13-sb leading-[16px] text-[var(--color-text)]">
              {pkg.special}
            </p>
          </div>

          {/* Customization — 13px / 400 */}
          <div className="border-t border-[var(--color-text-muted)] py-4">
            <p className="whitespace-pre-line text-center text-body-13-r leading-[16px] text-[var(--color-text)]">
              {pkg.customization}
            </p>
          </div>

          {/* Hearts */}
          <div className="flex justify-center gap-2 border-t border-[var(--color-text-muted)] py-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <HeartIcon key={i} filled={i < pkg.hearts} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
