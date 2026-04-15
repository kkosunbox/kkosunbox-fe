"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import {
  PACKAGES,
  COMPARE_PACKAGES,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "./packageData";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

/* ─── Icons ─── */
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" className="shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="8" style={{ fill: color }} />
      <path
        d="M6 9L8 11L12 7"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

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
      aria-label="목록으로 돌아가기"
      className="flex h-6 w-6 items-center justify-center opacity-60 transition-opacity hover:opacity-100"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path
          d="M11.5 1.5L1.5 11.5M1.5 1.5L11.5 11.5"
          stroke="var(--color-text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export type PackageDetailPrimaryButton = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

/* ─── Props ─── */
interface Props {
  plan: SubscriptionPlanDto;
  allPlans: SubscriptionPlanDto[];
  onSelectPlan: (plan: SubscriptionPlanDto) => void;
  onClose: () => void;
  /** 미지정 시 결제(구독하기) 플로우 */
  getPrimaryButton?: (plan: SubscriptionPlanDto) => PackageDetailPrimaryButton;
}

export default function PackageDetailView({
  plan,
  allPlans,
  onSelectPlan,
  onClose,
  getPrimaryButton,
}: Props) {
  const router = useRouter();
  const selectedTier = tierFromSubscriptionPlan(plan);
  const pkg = PACKAGES.find((p) => p.tier === selectedTier)!;
  const [compareIndex, setCompareIndex] = useState(
    COMPARE_PACKAGES.findIndex((p) => p.tier === selectedTier)
  );
  const comparePkg = COMPARE_PACKAGES[compareIndex];

  function defaultPrimary(p: SubscriptionPlanDto): PackageDetailPrimaryButton {
    return {
      label: "구독하기",
      onClick: () => router.push(`/order?planId=${p.id}`),
    };
  }

  function primaryFor(p: SubscriptionPlanDto): PackageDetailPrimaryButton {
    return getPrimaryButton ? getPrimaryButton(p) : defaultPrimary(p);
  }

  function selectTier(tier: PackageTier) {
    const next = allPlans.find((ap) => tierFromSubscriptionPlan(ap) === tier);
    if (next) onSelectPlan(next);
  }

  return (
    <>
      {/* ══ MOBILE LAYOUT (lg 미만) ══════════════════════════════════ */}
      <div className="lg:hidden flex flex-col gap-4">

        {/* 상단: 패키지 정보 카드 — 모바일 탭 선택 시 숨김 (탭은 SubscribePlansSection에서 렌더) */}
        <div
          className="max-md:hidden flex flex-col rounded-[20px] px-7 pb-7 pt-5"
          style={{ background: "var(--color-background)" }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <span
              className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
              style={{ background: pkg.colorVar }}
            >
              {pkg.tier}
            </span>
          </div>

          <div className="mb-[56px] flex justify-center">
            <Image
              src={mockTempPackage}
              alt={`${pkg.name} 이미지`}
              className="h-[150px] w-auto object-contain"
            />
          </div>

          <h2 className="mb-7.5 text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
            {plan.name || pkg.name}
          </h2>
          {plan.description ? (
            <p className="mb-4 text-body-13-r text-[var(--color-text-secondary)]">{plan.description}</p>
          ) : null}

          <ul className="mb-7 flex flex-col gap-[14px]">
            {pkg.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-body-13-m leading-[16px] text-black"
              >
                <CheckIcon color={pkg.colorVar} />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-auto mb-7 flex items-center justify-between border-t border-white pt-3">
            <span className="text-body-14-b text-black">월 요금제</span>
            <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
              {formatMonthlyPrice(plan.monthlyPrice)}
            </span>
          </div>

          {(() => {
            const { label, onClick, disabled } = primaryFor(plan);
            return (
              <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
                style={{ background: pkg.colorVar }}
              >
                {label}
              </button>
            );
          })()}
        </div>

        {/* 하단: 비교 상세 카드 */}
        <div
          className="relative rounded-[20px] px-5 pb-6 pt-5"
          style={{ background: "var(--color-surface-warm)" }}
        >
          <div className="absolute right-5 top-5">
            <CloseButton onClick={onClose} />
          </div>

          <p className="mb-3 text-center text-subtitle-16-sb leading-[22px] tracking-[-0.04em] text-[var(--color-text)]">
            {comparePkg.name}
          </p>

          <div className="mb-4 flex justify-center">
            <span
              className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
              style={{ background: comparePkg.colorVar }}
            >
              {comparePkg.tier}
            </span>
          </div>

          <div className="overflow-hidden rounded-[20px] bg-white">
            <div className="border-b border-[var(--color-text-muted)] px-5 py-4">
              <p
                className="text-center text-body-13-r text-[var(--color-text)]"
                style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
              >
                &ldquo;{comparePkg.quote}&rdquo;
              </p>
            </div>

            <div className="flex flex-col items-center gap-0.5 border-b border-[var(--color-text-muted)] px-5 py-4">
              {comparePkg.contents.map((c) => (
                <p
                  key={c}
                  className="text-center text-body-13-b leading-[20px]"
                  style={{ color: comparePkg.colorVar }}
                >
                  {c}
                </p>
              ))}
            </div>

            <div className="border-b border-[var(--color-text-muted)] px-5 py-4">
              <p className="text-center text-body-13-r leading-[18px] text-[var(--color-text)]">
                {comparePkg.special}
              </p>
            </div>

            <div className="border-b border-[var(--color-text-muted)] px-5 py-4">
              <p className="whitespace-pre-line text-center text-body-13-r leading-[18px] text-[var(--color-text)]">
                {comparePkg.customization}
              </p>
            </div>

            <div className="flex justify-center gap-1 px-5 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <HeartIcon key={i} filled={i < comparePkg.hearts} />
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {COMPARE_PACKAGES.map((p, i) => (
              <button
                key={p.tier}
                type="button"
                onClick={() => setCompareIndex(i)}
                aria-label={`${p.name} 비교 보기`}
                className="h-2 rounded-full transition-all"
                style={{
                  width: "8px",
                  background: i === compareIndex ? p.colorVar : "var(--color-text-muted)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══ DESKTOP LAYOUT (lg 이상) ══════════════════════════════════ */}
      <div
        className="max-lg:hidden relative overflow-hidden rounded-[20px]"
        style={{ background: "var(--color-surface-warm)" }}
      >
        <div className="absolute right-6 top-5 z-10">
          <CloseButton onClick={onClose} />
        </div>

        <div className="flex lg:flex-row lg:items-stretch lg:min-h-[570px]">

          {/* Left panel */}
          <div className="flex w-full flex-col px-7 pb-7 pt-5 lg:w-[327px] lg:shrink-0">
            <div className="mb-2.5">
              <span
                className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
                style={{ background: pkg.colorVar }}
              >
                {pkg.tier}
              </span>
            </div>

            <div className="mb-[56px] flex justify-center">
              <Image
                src={mockTempPackage}
                alt={`${pkg.name} 이미지`}
                className="h-[150px] w-auto object-contain"
              />
            </div>

            <h2 className="mb-7.5 text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
              {plan.name || pkg.name}
            </h2>
            {plan.description ? (
              <p className="mb-4 text-body-13-r text-[var(--color-text-secondary)]">{plan.description}</p>
            ) : null}

            <ul className="mb-7 flex flex-col gap-[14px]">
              {pkg.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-body-13-m leading-[16px] text-black"
                >
                  <CheckIcon color={pkg.colorVar} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto mb-7 flex items-center justify-between border-t border-white pt-3">
              <span className="text-body-14-b text-black">월 요금제</span>
              <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
                {formatMonthlyPrice(plan.monthlyPrice)}
              </span>
            </div>

            {(() => {
              const { label, onClick, disabled } = primaryFor(plan);
              return (
                <button
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
                  style={{ background: pkg.colorVar }}
                >
                  {label}
                </button>
              );
            })()}
          </div>

          {/* Right: comparison table */}
          <div className="flex flex-1 flex-col pb-8 pl-0 pr-7 pt-[61px]">
            <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] bg-white">

              {/* Tabs */}
              <div className="flex gap-0.5 px-6 pt-8 md:pt-12">
                {COMPARE_PACKAGES.map((p) => (
                  <button
                    key={p.tier}
                    type="button"
                    onClick={() => selectTier(p.tier)}
                    className="h-[37px] flex-1 truncate px-2 font-semibold tracking-[-0.04em] transition-colors text-body-13-sb"
                    style={{
                      borderRadius: "20px 20px 0 0",
                      background: selectedTier === p.tier ? p.tabActiveBg : "var(--color-ui-inactive-bg)",
                      color: selectedTier === p.tier ? "var(--color-text)" : "var(--color-text-secondary)",
                      fontSize: selectedTier === p.tier ? "14px" : "13px",
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Comparison table */}
              <div className="flex-1 overflow-x-auto">
                <div className="min-w-[360px] px-6">

                  <div className="grid grid-cols-3">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center py-5">
                        <span
                          className="inline-block rounded-full px-3 py-[3px] text-body-13-sb text-white"
                          style={{
                            background:
                              selectedTier === p.tier ? p.colorVar : "var(--color-text-muted)",
                          }}
                        >
                          {p.tier}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 border-t border-b border-[var(--color-text-muted)]">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                        <p
                          className="whitespace-pre-line text-center text-body-13-r leading-[17px] text-[var(--color-text)]"
                          style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
                        >
                          &ldquo;{p.quote}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 border-b border-[var(--color-text-muted)]">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex flex-col items-center justify-center gap-0.5 px-2 py-3">
                        {p.contents.map((c) => (
                          <p
                            key={c}
                            className={`text-center leading-[20px] ${selectedTier === p.tier ? "text-body-13-b" : "text-body-13-r"}`}
                            style={{ color: selectedTier === p.tier ? p.colorVar : "var(--color-text)" }}
                          >
                            {c}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 border-b border-[var(--color-text-muted)]">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                        <p className="text-center text-body-13-r leading-[16px] text-[var(--color-text)]">
                          {p.special}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 border-b border-[var(--color-text-muted)]">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center px-2 py-3">
                        <p className="whitespace-pre-line text-center text-body-13-r leading-[16px] text-[var(--color-text)]">
                          {p.customization}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 py-3">
                    {COMPARE_PACKAGES.map((p) => (
                      <div key={p.tier} className="flex items-center justify-center gap-1">
                        {Array.from({ length: p.hearts }).map((_, i) => (
                          <HeartIcon key={i} filled={selectedTier === p.tier} />
                        ))}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
