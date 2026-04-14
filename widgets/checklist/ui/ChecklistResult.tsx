"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import checklistDoneTitle from "../assets/checklist-done-title.png";
import checklistDoneTitlePaws from "../assets/checklist-done-title-paws.png";
import checklistDoneTitlePawsMobile from "../assets/checklist-done-title-paws-mobile.png";
import doubleTwinkle from "@/widgets/subscribe/recommend/assets/double-twinkle.png";
import stamp from "@/widgets/subscribe/recommend/assets/stamp.png";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import {
  PACKAGES,
  comparePlansForDisplayOrder,
  tierFromSubscriptionPlan,
} from "@/widgets/subscribe/plans/ui/packageData";
import PackageDetailView from "@/widgets/subscribe/plans/ui/PackageDetailView";
import type { PackageTier } from "@/widgets/subscribe/plans/ui/packageData";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { PetInfo, RecommendedTier } from "./types";

const TIER_LABEL: Record<RecommendedTier, string> = {
  basic: "베이직",
  standard: "스탠다드",
  premium: "프리미엄",
};

/** 추천 티어부터 Premium까지의 패키지 목록 (모바일 뱃지용) */
const TIER_ORDER: RecommendedTier[] = ["basic", "standard", "premium"];
function getMobileBadgeTiers(recommendedTier: RecommendedTier) {
  const idx = TIER_ORDER.indexOf(recommendedTier);
  return TIER_ORDER.slice(idx).map((id) => PACKAGES.find((p) => p.id === id)!);
}

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

/* ── Props ─── */
interface Props {
  petInfo: PetInfo;
  avatarSrc: string | null;
  recommendedTier: RecommendedTier;
}

export default function ChecklistResult({ petInfo, avatarSrc, recommendedTier }: Props) {
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

  const petName = petInfo.name.trim() || "우리 아이";
  const recommended = PACKAGES.find((p) => p.id === recommendedTier)!;
  const mobileBadgeTiers = getMobileBadgeTiers(recommendedTier);

  /** 모바일 추천 문구: 추천 범위에 따라 달라짐 */
  const mobileDescription = (() => {
    if (recommendedTier === "premium") {
      return (
        <>
          <strong className="font-bold">{petName}</strong>에게 꼭 필요한 영양만 꽉 채운{" "}
          <strong className="font-bold">프리미엄 패키지</strong>입니다.
        </>
      );
    }
    if (recommendedTier === "standard") {
      return (
        <>
          <strong className="font-bold">{petName}</strong>에게 가장 추천드리는 구성은{" "}
          <strong className="font-bold">프리미엄, 스탠다드 패키지</strong>입니다.
        </>
      );
    }
    // basic
    return (
      <>
        <strong className="font-bold">{petName}</strong>에게 꼭 필요한 프리미엄, 스탠다드, 베이직의{" "}
        <strong className="font-bold">모든 구성을 추천</strong>드립니다.
      </>
    );
  })();

  /* 상세 뷰 */
  if (selectedTier) {
    const detailPlan = sortedPlans.find((p) => tierFromSubscriptionPlan(p) === selectedTier);
    return (
      <section className="min-h-[calc(100vh-54px)] bg-white py-10 md:py-14">
        <div className="mx-auto w-full max-w-[1013px] px-4 md:px-8">
          {plansLoading ? (
            <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">플랜 정보를 불러오는 중…</p>
          ) : detailPlan ? (
            <PackageDetailView
              key={detailPlan.id}
              plan={detailPlan}
              allPlans={sortedPlans}
              onSelectPlan={(p) => {
                setSelectedTier(tierFromSubscriptionPlan(p));
              }}
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
    <section className="min-h-[calc(100vh-54px)] bg-white py-10 md:py-14">
      <div className="mx-auto w-full max-w-[1013px] px-4 md:px-8">

        {/* 완료 타이틀 */}
        <div className="mb-8 flex justify-center md:mb-10">
          <h1 className="m-0">
            <Image
              src={checklistDoneTitle}
              alt="체크리스트 분석 완료!"
              className="mx-auto h-auto max-md:w-[min(100%,280px)] max-md:max-w-[150px] md:w-auto md:max-w-[198px]"
              priority
            />
          </h1>
        </div>

        {/* 추천 배너 */}
        <div className="relative mb-6 md:mb-8">
          {/* 모바일: 아바타가 박스 위로 돌출 */}
          <div className="relative z-10 -mb-[32px] flex justify-center md:hidden">
            <div
              className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-text-muted)]"
              style={{ background: "var(--color-secondary)" }}
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="반려견 프로필" className="h-full w-full object-cover" />
              ) : (
                <span className="text-emoji-32">🐶</span>
              )}
            </div>
          </div>

          <div
            className="relative flex overflow-hidden rounded-[20px] max-md:flex-col max-md:items-center max-md:px-5 max-md:pb-5 max-md:pt-[44px] max-md:text-center md:h-[126px] md:flex-row md:items-center md:gap-6 md:px-8"
            style={{ background: "var(--gradient-checklist-result)" }}
          >
            {/* 데스크톱: 아바타 인라인 */}
            <div
              className="flex h-[78px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-text-muted)] max-md:hidden"
              style={{ background: "var(--color-secondary)" }}
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="반려견 프로필" className="h-full w-full object-cover" />
              ) : (
                <span className="text-emoji-38">🐶</span>
              )}
            </div>

            {/* 추천 내용 */}
            <div className="flex flex-col gap-2 max-md:items-center">
              {/* 모바일: 추천 범위 뱃지들 */}
              <div className="flex items-center gap-1.5 md:hidden">
                {mobileBadgeTiers.map((pkg) => (
                  <span
                    key={pkg.id}
                    className="flex h-[24px] items-center rounded-full px-3 text-body-13-sb leading-[1] text-white"
                    style={{ background: pkg.colorVar }}
                  >
                    {pkg.tier}
                  </span>
                ))}
              </div>

              {/* 데스크톱: 단일 뱃지 */}
              <span
                className="w-fit rounded-full px-4 py-1 text-body-14-sb leading-[1] text-white max-md:hidden"
                style={{ background: recommended.colorVar }}
              >
                {recommended.tier}
              </span>

              {/* 모바일 문구 */}
              <p
                className="text-body-13-r leading-[1.6] tracking-[-0.02em] text-[var(--color-text)] md:hidden"
                style={{
                  fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
                }}
              >
                체크리스트 분석 완료! {mobileDescription}
              </p>

              {/* 데스크톱 문구 */}
              <p
                className="text-body-16-r leading-[1.6] tracking-[-0.02em] text-[var(--color-text)] max-md:hidden"
                style={{
                  fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
                }}
              >
                체크리스트 분석 완료!{" "}
                <strong className="font-bold">{petName}</strong>에게 꼭 필요한 영양만 꽉 채운{" "}
                <strong className="font-bold">{TIER_LABEL[recommendedTier]} 패키지</strong>입니다.
              </p>
            </div>

            {/* 발자국 장식 — 데스크톱 */}
            <Image
              src={checklistDoneTitlePaws}
              alt=""
              aria-hidden
              className="pointer-events-none absolute right-6 top-1/2 h-[80px] w-auto -translate-y-1/2 max-md:hidden"
            />
            {/* 발자국 장식 — 모바일 (우하단 배경) */}
            <Image
              src={checklistDoneTitlePawsMobile}
              alt=""
              aria-hidden
              className="pointer-events-none absolute bottom-7 right-5 h-[60px] w-auto opacity-40 md:hidden"
            />
          </div>
        </div>

        {/* 패키지 카드 3종 */}
        <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-4">
          {PACKAGES.map((pkg) => {
            const isRecommended = TIER_ORDER.indexOf(pkg.id as RecommendedTier) >= TIER_ORDER.indexOf(recommendedTier);
            return (
              <div
                key={pkg.tier}
                className="flex flex-col rounded-[20px] px-6 pb-7 pt-5"
                style={{ background: "var(--color-support-faq-surface)" }}
              >
                {/* 상단: 칩 + ⓘ 버튼 */}
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className="flex h-[24px] items-center rounded-full px-3 max-md:text-body-13-sb md:text-body-14-sb leading-[1] text-white md:px-4"
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
                      className="absolute -top-6 right-2 h-[120px] w-[120px] object-contain md:-right-5 md:-top-8 md:h-[140px] md:w-[140px]"
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
                      className="absolute -left-5 -top-8 h-[36px] w-[36px] object-contain md:h-[40px] md:w-[40px]"
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
                  <span
                    className="text-price-20-eb"
                    style={{ color: "var(--color-surface-dark)" }}
                  >
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
                  className="flex h-[48px] w-full items-center justify-center rounded-full text-subtitle-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80"
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
