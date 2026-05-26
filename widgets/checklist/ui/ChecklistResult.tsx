"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import {
  PACKAGES,
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  tierFromSubscriptionPlan,
  type PackageData,
  type PackageTier,
} from "@/widgets/subscribe/plans/ui/packageData";
import { PackageCompareTable } from "@/widgets/subscribe/plans/ui/PackageDetailView";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { PetInfo, RecommendedTier } from "./types";
import checklistHeroTitle from "@/widgets/checklist/assets/checklist-hero-title-new.png";
import stamp from "@/widgets/subscribe/recommend/assets/stamp.webp";
import checklistLetStartPurchase from "@/widgets/checklist/assets/checklist-let-start-purchase.png";
import packageExplainWithBasic from "@/widgets/home/package-plans/assets/package-explain-with-basic.png";
import packageExplainWithPremium from "@/widgets/home/package-plans/assets/package-explain-with-premium.png";
import packageExplainWithStandard from "@/widgets/home/package-plans/assets/package-explain-with-standard.png";
import packageImageBasic from "@/widgets/home/package-plans/assets/package-image-basic.png";
import packageImagePremium from "@/widgets/home/package-plans/assets/package-image-premium.png";
import packageImageStandard from "@/widgets/home/package-plans/assets/package-image-standard.png";

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

const TIER_LABEL: Record<RecommendedTier, string> = {
  basic: "베이직",
  standard: "스탠다드",
  premium: "프리미엄",
};

const PACKAGE_EXPLAIN_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageExplainWithBasic,
  Standard: packageExplainWithStandard,
  Premium: packageExplainWithPremium,
};

const PACKAGE_SUMMARY_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

const GRIUN_FONT = '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif';

interface RecommendReason {
  title: string;
  description: string;
}

const RECOMMENDATION_REASONS: Record<RecommendedTier, RecommendReason[]> = {
  premium: [
    {
      title: "다양한 간식을 좋아해요",
      description:
        "우리 아이는 한 가지 간식보다 다양한 맛과 식감을 경험하는 것을 좋아하는 타입이에요. 매달 새로운 수제 간식을 통해 즐거운 간식 시간을 만들어줄 수 있어요.",
    },
    {
      title: "새로운 맛에 대한 호기심이 높아요",
      description:
        "새로운 간식에도 거부감 없이 잘 적응하는 편이라, 여러 종류의 간식을 경험할수록 만족도가 높아질 가능성이 커요.",
    },
    {
      title: "건강 관리가 필요한 시기예요",
      description:
        "지금 우리 아이에게는 맛뿐 아니라 건강까지 함께 챙기는 것이 중요해요. 꼬순박스의 수제 간식은 건강한 원재료를 바탕으로 더욱 안심하고 급여할 수 있어요.",
    },
  ],
  standard: [
    {
      title: "균형 잡힌 영양을 원해요",
      description:
        "우리 아이에게 맛있으면서도 영양까지 챙긴 간식이 필요해요. 스탠다드 패키지는 인기 간식과 특별 간식이 균형 있게 구성되어 있어요.",
    },
    {
      title: "다양한 구성을 선호해요",
      description:
        "매달 새로운 조합으로 아이의 입맛을 자극해줄 수 있어요. 가장 많이 선택되는 베스트 구성으로 만족도가 높아요.",
    },
    {
      title: "건강한 원료를 원해요",
      description:
        "휴먼그레이드 재료에 슈퍼푸드까지 추가된 구성으로 건강까지 챙길 수 있어요. 알러지 제외와 기호성 반영도 가능해요.",
    },
  ],
  basic: [
    {
      title: "처음 시작하기에 딱 좋아요",
      description:
        "간식을 처음 접하거나 새로운 브랜드를 가볍게 시작하고 싶을 때 베이직 패키지가 안성맞춤이에요.",
    },
    {
      title: "기본 인기 간식으로 구성되어 있어요",
      description:
        "많은 반려견이 좋아하는 기본 인기 간식들로 구성되어 처음에도 거부감 없이 즐길 수 있어요.",
    },
    {
      title: "알러지 걱정 없이 안심해요",
      description:
        "알러지를 고려한 선택이 가능해서 민감한 아이도 안전하게 즐길 수 있어요.",
    },
  ],
};


/* ── Info 아이콘 ─── */
function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
      <path d="M12 11V17" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.2" fill="white" />
    </svg>
  );
}

/* ── 추천 카드 내부 ─── */

interface CardBodyProps {
  petName: string;
  avatarSrc: string | null;
  effectiveRecommendedTier: RecommendedTier;
  tierColorVar: string;
  tierLabel: string;
  pkg: PackageData;
  explainImage: StaticImageData;
  reasons: RecommendReason[];
  onNutritionClick: () => void;
  onDetailClick: () => void;
}

function CardBody({
  petName,
  avatarSrc,
  effectiveRecommendedTier,
  tierColorVar,
  tierLabel,
  pkg,
  explainImage,
  reasons,
  onNutritionClick,
  onDetailClick,
}: CardBodyProps) {
  return (
    <div className="p-[36px] max-md:p-5">

      {/* 상단: 아바타 + 뱃지 + 설명 */}
      <div className="mb-[39px] flex items-center gap-8 max-md:mb-5 max-md:gap-4">
        {/* 아바타 */}
        <div
          className="flex h-[78px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-text-muted)] max-md:h-[56px] max-md:w-[56px]"
          style={{ background: "var(--color-secondary)" }}
        >
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt="반려견 프로필" className="h-full w-full object-cover" />
          ) : (
            <span className="text-emoji-34 max-md:text-emoji-28">🐶</span>
          )}
        </div>

        {/* 뱃지 + 설명 */}
        <div className="flex flex-col gap-2">
          <span
            className="inline-flex h-[24px] w-fit items-center rounded-full px-3 text-[14px] font-semibold leading-[17px] text-white"
            style={{ background: tierColorVar }}
          >
            {tierLabel}
          </span>
          <p
            className="text-[16px] leading-[150%] tracking-[-0.02em] text-black max-md:text-[13px]"
            style={{ fontFamily: GRIUN_FONT }}
          >
            체크리스트 분석 완료!{" "}
            <strong className="font-semibold">{petName}</strong>에게 꼭 필요한 영양만 꽉 채운{" "}
            <strong className="font-semibold">{TIER_LABEL[effectiveRecommendedTier]} 패키지</strong>입니다.
          </p>
        </div>
      </div>

      {/* 본문: 이미지(좌) + 추천이유(우) */}
      <div className="flex gap-5 max-lg:flex-col">

        {/* 이미지 영역 — 외부 wrapper는 overflow-visible */}
        <div className="relative shrink-0 max-lg:aspect-[562/521] max-lg:w-full lg:h-[521px] lg:w-[562px]">
          {/* 이미지 클리핑 전용 — overflow-hidden은 여기서만 */}
          <div className="absolute inset-0 overflow-hidden rounded-[20px]">
            <Image
              src={explainImage}
              alt={`${pkg.name} 설명`}
              fill
              className="object-cover"
              sizes="(min-width: 1200px) 562px, calc(100vw - 72px)"
              priority
            />
            {/* 제품 상세보기 버튼 (우하단) */}
            <button
              type="button"
              onClick={onDetailClick}
              className="absolute bottom-[26px] right-[26px] flex h-[40px] w-[180px] items-center justify-center rounded-[8px] text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white shadow-md transition-opacity hover:opacity-90 active:opacity-80 max-md:bottom-4 max-md:right-4"
              style={{ background: "var(--color-brown-dark)" }}
            >
              제품 상세보기
            </button>
          </div>

          {/* ℹ 버튼 — 기존 위치 right-3 top-3 */}
          <button
            type="button"
            onClick={onNutritionClick}
            aria-label="영양정보 확인"
            className="absolute right-3 top-3 z-10 flex items-center justify-center transition-opacity hover:opacity-80 active:opacity-70"
          >
            <InfoIcon />
          </button>

          {/* 말풍선 — ℹ 버튼 기준 65px 오른쪽, 위로 올려 이미지 바깥 표시 */}
          <div className="pointer-events-none absolute right-3 top-3 z-20 -translate-y-full translate-x-[65px]">
            <Image
              src="/images/please-info-check.png"
              alt="영양정보 확인"
              width={130}
              height={55}
              className="h-auto w-[130px] max-md:w-[100px]"
            />
          </div>
        </div>

        {/* 추천이유 영역 */}
        <div
          className="flex shrink-0 flex-col rounded-[20px] p-[28px] max-lg:w-full max-lg:rounded-none max-lg:p-5 lg:h-[521px] lg:w-[359px]"
          style={{ background: "var(--color-recommend-reason-bg)" }}
        >
          {/* 제목 */}
          <h3
            className="mb-[28px] text-[20px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text)] max-md:mb-4 max-md:text-[18px]"
          >
            추천이유
          </h3>

          {/* 이유 목록 */}
          <div className="flex flex-col gap-[18px]">
            {reasons.map((reason) => (
              <div key={reason.title}>
                <p className="mb-[6px] text-[16px] font-semibold leading-[22px] tracking-[-0.04em] text-[var(--color-primary)]">
                  <span className="font-semibold text-black">✔</span> {reason.title}
                </p>
                <p className="indent-[1em] text-[16px] font-medium leading-[22px] tracking-[-0.04em] text-[var(--color-text)]">
                  {reason.description}
                </p>
              </div>
            ))}

            {/* 결론 */}
            <p className="text-[16px] font-semibold leading-[22px] tracking-[-0.04em] text-[var(--color-text)]">
              {"→ 그래서 우리 아이에게는 "}
              <span className="text-[18px]" style={{ color: tierColorVar }}>{`'${tierLabel} 패키지'`}</span>
              {"를 추천드려요!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Props ─── */

interface Props {
  petInfo: PetInfo;
  avatarSrc: string | null;
  recommendedTier: RecommendedTier;
  profileId?: number | null;
}

export default function ChecklistResult({
  petInfo,
  avatarSrc,
  recommendedTier,
  profileId,
}: Props) {
  const router = useRouter();
  const [showNutritionOverlay, setShowNutritionOverlay] = useState(false);
  const [apiPlans, setApiPlans] = useState<SubscriptionPlanDto[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const sortedPlans = useMemo(
    () => [...apiPlans].sort(comparePlansForDisplayOrder),
    [apiPlans],
  );

  useEffect(() => {
    let cancelled = false;
    getSubscriptionPlans(profileId ?? undefined)
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
  }, [profileId]);

  const apiRecommendedPlan = sortedPlans.find((plan) => plan.isRecommended);
  const apiRecommendedTier = apiRecommendedPlan
    ? (packageThemeForPlan(apiRecommendedPlan).tier.toLowerCase() as RecommendedTier)
    : null;
  const effectiveRecommendedTier = apiRecommendedTier ?? recommendedTier;

  const petName = petInfo.name.trim() || "우리 아이";
  const recommendedPlanTier = (
    effectiveRecommendedTier.charAt(0).toUpperCase() + effectiveRecommendedTier.slice(1)
  ) as PackageTier;
  const recommendedPkg = PACKAGES.find((p) => p.tier === recommendedPlanTier) ?? PACKAGES[2];
  const recommendedApiPlan = sortedPlans.find(
    (p) => tierFromSubscriptionPlan(p) === recommendedPlanTier,
  );
  const tierColorVar = recommendedApiPlan
    ? packageThemeForPlan(recommendedApiPlan).colorVar
    : recommendedPkg.colorVar;
  const tierLabel = recommendedApiPlan
    ? packageThemeForPlan(recommendedApiPlan).tierLabel
    : TIER_LABEL[effectiveRecommendedTier];

  const reasons = RECOMMENDATION_REASONS[effectiveRecommendedTier];
  const explainImage = PACKAGE_EXPLAIN_IMAGES[recommendedPlanTier];

  const navigateToDetail = () =>
    recommendedApiPlan &&
    router.push(`/subscribe/detail?planId=${recommendedApiPlan.id}`);

  const sharedCardProps: Omit<CardBodyProps, "onNutritionClick" | "onDetailClick"> = {
    petName,
    avatarSrc,
    effectiveRecommendedTier,
    tierColorVar,
    tierLabel,
    pkg: recommendedPkg,
    explainImage,
    reasons,
  };

  return (
    <section className="relative bg-white max-md:py-9 md:py-[64px] lg:py-[64px]">
      {/* 상단 웜 배경 밴드 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[200px]"
        style={{ background: "var(--color-support-faq-surface)" }}
        aria-hidden
      />

      <div className="relative mx-auto w-full px-4 max-md:max-w-[640px] md:max-w-[1013px] lg:max-w-[1013px] md:px-0 lg:px-0">

        {/* 페이지 제목 */}
        <Image
          src={checklistHeroTitle}
          alt="체크리스트 기반 맞춤 추천이 완료되었어요!"
          className="relative mx-auto mb-10 h-auto w-full max-w-[462px] max-md:mb-7 max-md:max-w-[300px]"
          sizes="(min-width: 768px) 462px, 300px"
          priority
        />

        {/* 메인 추천 카드 */}
        <div className="relative mb-14 rounded-[20px] bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.12)] max-md:mb-10">
          <CardBody
            {...sharedCardProps}
            onNutritionClick={() => setShowNutritionOverlay(true)}
            onDetailClick={navigateToDetail}
          />
        </div>

        {/* 영양정보 오버레이 — 비교 표만 표시 */}
        {showNutritionOverlay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setShowNutritionOverlay(false)}
          >
            <div
              className="max-h-[90vh] w-full max-w-[520px] overflow-auto rounded-[20px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <PackageCompareTable
                initialTier={recommendedPlanTier}
                onClose={() => setShowNutritionOverlay(false)}
              />
            </div>
          </div>
        )}

        {/* 하단: 전체 패키지 구독 섹션 */}
        {!plansLoading && sortedPlans.length > 0 && (
          <div>
            <Image
              src={checklistLetStartPurchase}
              alt="꼬순박스 정기구독을 시작해보세요!"
              className="mx-auto mb-[48px] h-auto w-full max-w-[380px] max-md:mb-7 max-md:max-w-[260px]"
              sizes="(min-width: 768px) 380px, 260px"
            />

            <div className="flex justify-between max-md:flex-col max-md:gap-5">
              {sortedPlans.map((plan) => {
                const tier = tierFromSubscriptionPlan(plan);
                const img = PACKAGE_SUMMARY_IMAGES[tier];
                const pkg = PACKAGES.find((p) => p.tier === tier);
                if (!pkg) return null;

                return (
                  <Link
                    key={plan.id}
                    href={`/subscribe/detail?planId=${plan.id}`}
                    className="flex w-full max-w-[272px] flex-col overflow-hidden rounded-[16px] bg-white max-md:max-w-full"
                  >
                    {/* 패키지 이미지 */}
                    <div className="relative h-[252px] w-full overflow-hidden max-md:h-[180px]">
                      <Image
                        src={img}
                        alt={pkg.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 272px, calc(100vw - 32px)"
                      />
                      {tier === recommendedPlanTier && (
                        <div className="absolute bottom-3 right-3 h-[144px] w-[144px]">
                          <Image
                            src={stamp}
                            alt="추천 도장"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="px-[18px] pb-[22px] pt-[20px]">
                      {/* 패키지명 */}
                      <p className="mb-[12px] text-[20px] font-bold leading-[24px] tracking-[-0.04em] text-[var(--color-surface-dark)]">
                        {pkg.name}
                      </p>

                      {/* 월 요금제 */}
                      <p className="mb-[6px] text-[16px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)]">
                        월 요금제
                      </p>

                      {/* 가격 행 */}
                      <div className="mb-[4px] flex items-baseline gap-[8px]">
                        <span className="text-[16px] font-semibold leading-[19px] tracking-[-0.05em] text-[var(--color-text-secondary)]">
                          {plan.discountRate}%
                        </span>
                        <span className="text-[20px] font-extrabold leading-[24px] tracking-[-0.05em] text-[var(--color-surface-dark)]">
                          {formatMonthlyPrice(plan.monthlyPrice)}
                        </span>
                      </div>

                      {/* 할인 문구 */}
                      <p className="text-[14px] font-semibold leading-[17px] tracking-[-0.05em] text-[var(--color-text-secondary)]">
                        최대 2천원 할인
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
