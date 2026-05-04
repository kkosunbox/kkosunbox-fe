"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import checklistDoneTitle from "../assets/checklist-done-title.webp";
import checklistDoneTitlePaws from "../assets/checklist-done-title-paws.webp";
import checklistDoneTitlePawsMobile from "../assets/checklist-done-title-paws-mobile.webp";
import doubleTwinkle from "@/widgets/subscribe/recommend/assets/double-twinkle.webp";
import stamp from "@/widgets/subscribe/recommend/assets/stamp.webp";
import { TIER_THUMBNAILS } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import {
  PACKAGES,
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  tierFromSubscriptionPlan,
} from "@/widgets/subscribe/plans/ui/packageData";
import PackageDetailView from "@/widgets/subscribe/plans/ui/PackageDetailView";
import MobileTierDetailPanel from "@/widgets/subscribe/plans/ui/MobileTierDetailPanel";
import type { PackageTier } from "@/widgets/subscribe/plans/ui/packageData";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { PetInfo, RecommendedTier } from "./types";

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

const TIER_LABEL: Record<RecommendedTier, string> = {
  basic: "베이직",
  standard: "스탠다드",
  premium: "프리미엄",
};

/** 추천 티어부터 Premium까지의 패키지 목록 (뱃지용) */
const TIER_ORDER: RecommendedTier[] = ["basic", "standard", "premium"];
function getRecommendedBadgeTiers(recommendedTier: RecommendedTier) {
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

/* ── Result Plan Card ─── */

interface ResultPlanCardProps {
  plan: SubscriptionPlanDto;
  isRecommended: boolean;
  onInfoClick: () => void;
}

function ResultPlanCard({ plan, isRecommended, onInfoClick }: ResultPlanCardProps) {
  const router = useRouter();
  const theme = packageThemeForPlan(plan);
  const pkg = PACKAGES.find((p) => p.tier === theme.tier);

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] bg-[var(--color-background)]">
      <div className="relative aspect-[327/252] w-full">
        <Image
          src={TIER_THUMBNAILS[theme.tier]}
          alt={`${plan.name} 이미지`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 px-7 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
              style={{ background: theme.colorVar }}
            >
              {theme.tierLabel}
            </span>
          </div>
          <button
            type="button"
            aria-label={`${plan.name} 패키지 상세 정보`}
            onClick={onInfoClick}
            className="flex shrink-0 items-center justify-center"
          >
            <InfoIcon />
          </button>
        </div>
        {isRecommended && (
          <Image
            src={stamp}
            alt="BEST CHOICE 추천 스탬프"
            className="pointer-events-none absolute right-3 top-12 h-[120px] w-[120px] object-contain md:right-4 md:top-14 md:h-[140px] md:w-[140px]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-7 pb-7 pt-5">
        <div className="relative mb-7.5">
          {isRecommended && (
            <Image
              src={doubleTwinkle}
              alt=""
              aria-hidden
              className="absolute -left-5 -top-8 h-[36px] w-[36px] object-contain md:h-[40px] md:w-[40px]"
            />
          )}
          <h2 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
            {plan.name}
          </h2>
        </div>

        {plan.description ? (
          <p className="mb-4 text-body-13-r text-[var(--color-text-secondary)]">
            {plan.description}
          </p>
        ) : null}

        <ul className="mb-7 flex flex-col gap-[14px]">
          {(pkg?.items ?? []).map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-body-13-m leading-[16px] text-black"
            >
              <CheckIcon color={theme.colorVar} />
              {item}
            </li>
          ))}
        </ul>

        <div className="mb-7 mt-auto flex items-center justify-between border-t border-[var(--color-text-muted)] pt-3">
          <span className="text-body-14-b text-black">월 요금제</span>
          <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
            {formatMonthlyPrice(plan.monthlyPrice)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/subscribe/detail?planId=${plan.id}`)}
          className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: theme.colorVar }}
        >
          제품 상세보기
        </button>
      </div>
    </div>
  );
}

/* ── Props ─── */
interface Props {
  petInfo: PetInfo;
  avatarSrc: string | null;
  recommendedTier: RecommendedTier;
}

export default function ChecklistResult({ petInfo, avatarSrc, recommendedTier }: Props) {
  const [selectedTier, setSelectedTier] = useState<PackageTier | null>(null);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<number>>(new Set());
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
  const recommendedBadgeTiers = getRecommendedBadgeTiers(recommendedTier);

  /** 모바일 추천 문구: 추천 범위에 따라 달라짐 */
  const mobileDescription = (() => {
    if (recommendedTier === "premium") {
      return (
        <>
          <strong className="text-body-16-m font-bold">{petName}</strong>에게 꼭 필요한 영양만 꽉 채운{" "}
          <strong className="font-bold">프리미엄 패키지</strong>입니다.
        </>
      );
    }
    if (recommendedTier === "standard") {
      return (
        <>
          <strong className="text-body-16-m font-bold">{petName}</strong>에게 가장 추천드리는 구성은{" "}
          <strong className="font-bold">프리미엄, 스탠다드 패키지</strong>입니다.
        </>
      );
    }
    // basic
    return (
      <>
        <strong className="text-body-16-m font-bold">{petName}</strong>에게 꼭 필요한 프리미엄, 스탠다드, 베이직의{" "}
        <strong className="font-bold">모든 구성을 추천</strong>드립니다.
      </>
    );
  })();

  const detailPlan = selectedTier
    ? sortedPlans.find((p) => tierFromSubscriptionPlan(p) === selectedTier)
    : null;

  return (
    <section className="min-h-[calc(100vh-54px)] bg-white py-10 md:py-14">
      <div className="mx-auto w-full max-w-[1013px] px-4 md:px-0">

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
                {recommendedBadgeTiers.map((pkg) => (
                  <span
                    key={pkg.id}
                    className="flex h-[24px] items-center rounded-full px-3 text-body-13-sb leading-[1] text-white"
                    style={{ background: pkg.colorVar }}
                  >
                    {pkg.tier}
                  </span>
                ))}
              </div>

              {/* 데스크톱: 추천 범위 뱃지들 */}
              <div className="flex items-center gap-2 max-md:hidden">
                {recommendedBadgeTiers.map((pkg) => (
                  <span
                    key={pkg.id}
                    className="flex h-[26px] items-center rounded-full px-4 text-body-14-sb leading-[1] text-white"
                    style={{ background: pkg.colorVar }}
                  >
                    {pkg.tier}
                  </span>
                ))}
              </div>

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
                <strong className="text-subtitle-18-m font-bold">{petName}</strong>에게 꼭 필요한 영양만 꽉 채운{" "}
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

        {/* 패키지 카드 */}
        {plansLoading ? (
          <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">
            플랜 정보를 불러오는 중…
          </p>
        ) : sortedPlans.length === 0 ? (
          <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">
            표시할 구독 플랜이 없습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <>
            {/* ══ Desktop (md+): i 버튼 → PackageDetailView 전체 교체 ══ */}
            <div className="max-md:hidden">
              {selectedTier ? (
                detailPlan ? (
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
                )
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {sortedPlans.map((plan) => {
                    const theme = packageThemeForPlan(plan);
                    const pkgId = theme.tier.toLowerCase() as RecommendedTier;
                    const isRecommended = TIER_ORDER.indexOf(pkgId) >= TIER_ORDER.indexOf(recommendedTier);
                    return (
                      <ResultPlanCard
                        key={plan.id}
                        plan={plan}
                        isRecommended={isRecommended}
                        onInfoClick={() => setSelectedTier(theme.tier)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* ══ Mobile (<md): i 버튼 → MobileTierDetailPanel 인라인 토글 ══ */}
            <div className="flex flex-col gap-4 md:hidden">
              {sortedPlans.map((plan) => {
                const theme = packageThemeForPlan(plan);
                const pkgId = theme.tier.toLowerCase() as RecommendedTier;
                const isRecommended = TIER_ORDER.indexOf(pkgId) >= TIER_ORDER.indexOf(recommendedTier);
                const isExactRecommended = pkgId === recommendedTier;
                const isExpanded = expandedPlanIds.has(plan.id);
                const orderClass = isExactRecommended ? " [order:-2]" : isRecommended ? " [order:-1]" : "";
                return (
                  <div key={plan.id} className={`flex flex-col${orderClass}`}>
                    {isExpanded ? (
                      <MobileTierDetailPanel
                        plan={plan}
                        onClose={() =>
                          setExpandedPlanIds((prev) => {
                            const next = new Set(prev);
                            next.delete(plan.id);
                            return next;
                          })
                        }
                      />
                    ) : (
                      <ResultPlanCard
                        plan={plan}
                        isRecommended={isRecommended}
                        onInfoClick={() =>
                          setExpandedPlanIds((prev) => {
                            const next = new Set(prev);
                            next.add(plan.id);
                            return next;
                          })
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
