"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import checklistDoneTitle from "@/widgets/checklist/assets/checklist-done-title.png";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import doubleTwinkle from "../assets/double-twinkle.png";
import stamp from "../assets/stamp.png";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import {
  PACKAGES,
  comparePlansForDisplayOrder,
  tierFromSubscriptionPlan,
} from "@/widgets/subscribe/plans/ui/packageData";
import PackageDetailView from "@/widgets/subscribe/plans/ui/PackageDetailView";
import type { PackageTier } from "@/widgets/subscribe/plans/ui/packageData";

export type RecommendedTier = "basic" | "standard" | "premium";

const TIER_LABEL: Record<RecommendedTier, string> = {
  basic: "베이직",
  standard: "스탠다드",
  premium: "프리미엄",
};

const TIER_DISPLAY: Record<RecommendedTier, PackageTier> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

/* ── Icons ─── */

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

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="10" stroke="var(--color-icon-muted)" strokeWidth="1.5" fill="none" />
      <path d="M11 10V15" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="7.5" r="1" fill="var(--color-icon-muted)" />
    </svg>
  );
}

function PetAvatarPlaceholder() {
  return (
    <div
      className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-text-muted)] max-md:text-emoji-28 md:h-[78px] md:w-[78px] md:text-emoji-34"
      style={{ background: "var(--color-secondary)" }}
      aria-hidden="true"
    >
      🐶
    </div>
  );
}

interface RecommendSectionProps {
  recommendedTier: RecommendedTier;
  petName: string;
}

export default function RecommendSection({ recommendedTier, petName }: RecommendSectionProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<PackageTier | null>(null);
  const [apiPlans, setApiPlans] = useState<SubscriptionPlanDto[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const sortedPlans = useMemo(
    () => [...apiPlans].sort(comparePlansForDisplayOrder),
    [apiPlans],
  );

  useEffect(() => {
    let cancelled = false;
    getSubscriptionPlans()
      .then((res) => {
        if (!cancelled) setApiPlans(res.plans);
      })
      .catch(() => {
        if (!cancelled) setApiPlans([]);
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const recommended = PACKAGES.find((p) => p.id === recommendedTier)!;
  const petNameDisplay = petName || "우리 아이";

  /* 상세 뷰 */
  if (selectedTier) {
    const detailPlan = sortedPlans.find((p) => tierFromSubscriptionPlan(p) === selectedTier);
    return (
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-content max-md:px-6 md:px-0">
          {plansLoading ? (
            <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">플랜 정보를 불러오는 중…</p>
          ) : detailPlan ? (
            <PackageDetailView
              key={detailPlan.id}
              plan={detailPlan}
              allPlans={sortedPlans}
              onSelectPlan={(p) => setSelectedTier(tierFromSubscriptionPlan(p))}
              onClose={() => setSelectedTier(null)}
            />
          ) : (
            <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">
              플랜 정보를 불러오지 못했습니다. 구독 페이지에서 다시 확인해 주세요.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 md:pt-10 md:pb-16">
      <div className="mx-auto max-w-content max-md:px-6 md:px-0">

        {/* Hero */}
        <div className="mb-10 flex justify-center md:mb-8">
          <h1 className="m-0">
            <Image
              src={checklistDoneTitle}
              alt="체크리스트 분석 완료!"
              className="mx-auto h-auto max-md:w-[min(100%,320px)] md:max-w-[198px] md:w-auto"
              priority
            />
          </h1>
        </div>

        {/* Recommendation banner */}
        <div
          className="mb-8 overflow-hidden rounded-[20px] md:mb-10 md:h-[126px]"
          style={{ background: "var(--gradient-checklist-result)" }}
        >
          <div className="relative flex items-center gap-5 px-6 py-5 md:h-full md:gap-6 md:px-8">
            <PetAvatarPlaceholder />
            <div className="flex flex-col gap-2">
              <span
                className="w-fit rounded-full px-3 py-1 max-md:text-body-13-sb md:text-body-14-sb leading-[1] text-white md:px-4"
                style={{ background: recommended.colorVar }}
              >
                {TIER_DISPLAY[recommendedTier]}
              </span>
              <p
                className="max-w-[537px] max-md:text-body-13-r md:text-body-16-r leading-[1.6] tracking-[-0.02em] text-[var(--color-text)]"
                style={{
                  fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
                }}
              >
                체크리스트 분석 완료!{" "}
                <strong className="font-bold" style={{ color: "var(--color-text)" }}>
                  {petNameDisplay}
                </strong>
                에게 꼭 필요한 영양만 꽉 채운{" "}
                <strong className="font-bold">{TIER_LABEL[recommendedTier]} 패키지</strong>
                입니다.
              </p>
            </div>
          </div>
        </div>

        {/* Package cards */}
        <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-4">
          {PACKAGES.map((pkg) => {
            const isRecommended = pkg.id === recommendedTier;
            return (
              <div
                key={pkg.tier}
                className="flex flex-col rounded-[20px] px-7 pb-7 pt-5"
                style={{ background: "var(--color-support-faq-surface)" }}
              >
                {/* 상단: 칩 + ⓘ 버튼 */}
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className="rounded-full px-3 py-1 max-md:text-body-13-sb md:text-body-14-sb leading-[1] text-white md:px-4"
                    style={{ background: pkg.colorVar }}
                  >
                    {pkg.tier}
                  </span>
                  {/* 우상단 ⓘ 버튼 → 상세 뷰 */}
                  <button
                    type="button"
                    aria-label={`${pkg.tier} 패키지 상세 정보`}
                    onClick={() => setSelectedTier(pkg.tier)}
                    className="flex items-center justify-center"
                  >
                    <InfoIcon />
                  </button>
                </div>

                {/* 상품 이미지 */}
                <div className="relative mb-6 flex justify-center">
                  <Image
                    src={mockTempPackage}
                    alt={`${pkg.name} 이미지`}
                    className="h-[140px] w-auto object-contain md:h-[151px]"
                  />
                  {isRecommended && (
                    <Image
                      src={stamp}
                      alt="BEST CHOICE 추천 스탬프"
                      className="absolute right-0 top-0 md:-right-3 md:-top-7 h-[72px] w-[72px] object-contain md:h-[140px] md:w-[140px]"
                    />
                  )}
                </div>

                {/* 패키지명 */}
                <div className="relative mb-4">
                  {isRecommended && (
                    <Image
                      src={doubleTwinkle}
                      alt=""
                      aria-hidden
                      className="absolute -left-2 -top-5 h-[36px] w-[36px] object-contain md:h-[40px] md:w-[40px]"
                    />
                  )}
                  <h2 className="text-display-20-eb text-[var(--color-text)]">
                    {pkg.name}
                  </h2>
                </div>

                {/* 특징 목록 */}
                <ul className="mb-6 flex flex-col gap-3">
                  {pkg.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-body-13-m leading-[1] text-[var(--color-text)]"
                    >
                      <CheckIcon color={pkg.colorVar} />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* 가격 */}
                <div className="mb-5 md:mb-7 mt-auto flex items-center justify-between border-t border-white pt-5">
                  <span className="text-body-13-b text-[var(--color-text)]">월 요금제</span>
                  <span className="text-price-20-eb text-[var(--color-surface-dark)]">
                    {pkg.price}
                  </span>
                </div>

                {/* 구독하기 → 결제 페이지 */}
                <button
                  type="button"
                  onClick={() => {
                    const match = sortedPlans.find(
                      (p) => tierFromSubscriptionPlan(p) === pkg.tier,
                    );
                    if (match) router.push(`/order?planId=${match.id}`);
                    else router.push("/subscribe");
                  }}
                  className="flex h-[52px] w-full items-center justify-center rounded-full text-subtitle-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80"
                  style={{ background: pkg.colorVar }}
                >
                  구독하기
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
