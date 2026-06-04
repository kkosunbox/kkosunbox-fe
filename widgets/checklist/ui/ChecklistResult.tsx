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
import PackageNutritionGuide from "@/widgets/subscribe/plans/ui/PackageNutritionGuide";
import { TIER_DETAIL_HERO_IMAGES } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { CheckCircleIcon } from "@/shared/ui";
import type { RecommendReasonDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { PetInfo, RecommendedTier } from "./types";
import { usePlanRatings } from "@/widgets/subscribe/plans/ui/usePlanRatings";
import checklistHeroTitle from "@/widgets/checklist/assets/checklist-hero-title-new.png";
import stamp from "@/widgets/checklist/assets/stamp-new.png";
import checklistLetStartPurchase from "@/widgets/checklist/assets/checklist-let-start-purchase.png";
import reasonCheckIcon from "@/widgets/checklist/assets/check.svg";
import packageExplainWithBasic from "@/widgets/home/package-plans/assets/package-explain-with-basic.png";
import packageExplainWithPremium from "@/widgets/home/package-plans/assets/package-explain-with-premium.png";
import packageExplainWithStandard from "@/widgets/home/package-plans/assets/package-explain-with-standard.png";
import packageImageBasic from "@/widgets/home/package-plans/assets/package-image-basic.png";
import packageImagePremium from "@/widgets/home/package-plans/assets/package-image-premium.png";
import packageImageStandard from "@/widgets/home/package-plans/assets/package-image-standard.png";
import { PackageSummaryThumbnail } from "@/widgets/home/package-plans/ui/PackageSummaryThumbnail";

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

const STAR_PATH =
  "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function PlanStarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const hasHalf = score - full >= 0.25;

  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => {
        const isFull = i < full;
        const isHalf = !isFull && i === full && hasHalf;
        return (
          <svg key={i} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path
              d={STAR_PATH}
              fill={isFull || isHalf ? "var(--color-star)" : "var(--color-text-muted)"}
            />
            {isHalf && (
              <path
                d={STAR_PATH}
                fill="var(--color-text-muted)"
                style={{ clipPath: "inset(0 0 0 50%)" }}
              />
            )}
          </svg>
        );
      })}
    </div>
  );
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

type RecommendReason = RecommendReasonDto;

/* ── 추천 카드 내부 (데스크탑·태블릿 전용) ─── */

interface CardBodyProps {
  petName: string;
  avatarSrc: string | null;
  effectiveRecommendedTier: RecommendedTier;
  tierColorVar: string;
  tierLabel: string;
  pkg: PackageData;
  explainImage: StaticImageData;
  reasons: RecommendReason[];
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
  onDetailClick,
}: CardBodyProps) {
  return (
    <div className="p-[36px]">

      {/* 상단: 아바타 + 뱃지 + 설명 */}
      <div className="mb-[39px] flex items-center gap-8">
        {/* 아바타 */}
        <div
          className="flex h-[78px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-text-muted)]"
          style={{ background: "var(--color-secondary)" }}
        >
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt="반려견 프로필" className="h-full w-full object-cover" />
          ) : (
            <span className="text-emoji-34">🐶</span>
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
          <p className="text-body-16-m-griun leading-[1.5] tracking-[-0.02em] text-[var(--color-text)]">
            체크리스트 분석 완료!{" "}
            <strong className="text-title-24-sb">{petName}</strong>에게 꼭 필요한 영양만 꽉 채운{" "}
            <strong className="text-body-16-sb" style={{ color: tierColorVar }}>
              {tierLabel} 패키지
            </strong>
            입니다.
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
              className="absolute bottom-[26px] right-[26px] flex h-[40px] w-[180px] items-center justify-center rounded-[8px] text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white shadow-md transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: "var(--color-brown-dark)" }}
            >
              제품 상세보기
            </button>
          </div>

          <PackageNutritionGuide initialTier={pkg.tier} />
        </div>

        {/* 추천이유 영역 */}
        <div
          className="flex shrink-0 flex-col rounded-[20px] p-[28px] max-lg:w-full max-lg:rounded-none max-lg:p-5 lg:h-[521px] lg:w-[359px]"
          style={{ background: "var(--color-recommend-reason-bg)" }}
        >
          {/* 제목 */}
          <h3
            className="mb-6 text-[20px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text)]"
          >
            추천이유
          </h3>

          {/* 이유 목록 */}
          <div className="flex flex-col gap-[24px]">
            {reasons.map((reason) => (
              <div key={reason.title}>
                <div className="mb-1 flex items-start gap-1">
                  <Image
                    src={reasonCheckIcon}
                    alt=""
                    width={16}
                    height={16}
                    className="mt-[3px] shrink-0"
                    aria-hidden
                  />
                  <span className="text-[16px] font-semibold leading-[22px] tracking-[-0.04em] text-[var(--color-recommend-reason-title)]">
                    {reason.title}
                  </span>
                </div>
                <p className="text-body-14-m tracking-[-0.04em] text-[var(--color-text)]">
                  {reason.content}
                </p>
              </div>
            ))}

            {/* 결론 */}
            <p className="text-body-16-sb tracking-[-0.04em] text-[var(--color-text)]">
              {"→ 그래서 우리 아이에게는 "}
              <span className="text-display-20-eb" style={{ color: tierColorVar }}>
                {`'${tierLabel} 패키지'`}
              </span>
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
  const [apiPlans, setApiPlans] = useState<SubscriptionPlanDto[]>([]);
  const [recommendReasons, setRecommendReasons] = useState<RecommendReason[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const sortedPlans = useMemo(
    () => [...apiPlans].sort(comparePlansForDisplayOrder),
    [apiPlans],
  );

  useEffect(() => {
    let cancelled = false;
    getSubscriptionPlans(profileId ?? undefined)
      .then((res) => {
        if (!cancelled) {
          setApiPlans(res.plans);
          setRecommendReasons(res.recommendReasons ?? []);
        }
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

  const planRatings = usePlanRatings(sortedPlans.map((p) => p.id));

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

  const reasons = recommendReasons;
  const explainImage = PACKAGE_EXPLAIN_IMAGES[recommendedPlanTier];

  const navigateToDetail = () =>
    recommendedApiPlan &&
    router.push(`/subscribe/detail?planId=${recommendedApiPlan.id}`);

  const sharedCardProps: Omit<CardBodyProps, "onDetailClick"> = {
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
    <section className="relative bg-white max-md:pt-0 max-md:pb-9 md:py-[64px] lg:py-[64px]">
      {/* 데스크탑·태블릿 상단 웜 배경 밴드 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[200px] max-md:hidden"
        style={{ background: "var(--color-support-faq-surface)" }}
        aria-hidden
      />

      {/* 모바일 전용: FFF7EF 배너 — 아바타 + 분석 결과 텍스트 */}
      <div
        className="md:hidden flex items-center gap-4 px-6 py-[21px]"
        style={{ background: "var(--color-support-faq-surface)" }}
      >
        <div
          className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-text-muted)]"
          style={{ background: "var(--color-secondary)" }}
        >
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt="반려견 프로필" className="h-full w-full object-cover" />
          ) : (
            <span className="text-emoji-28">🐶</span>
          )}
        </div>
        <p className="text-body-14-m-griun leading-[1.5] tracking-[-0.02em] text-[var(--color-text)]">
          체크리스트 분석 완료!{" "}
          <strong className="text-subtitle-18-sb">{petName}</strong>에게 꼭 필요한 영양만 꽉 채운{" "}
          <strong className="text-body-14-sb" style={{ color: tierColorVar }}>
            {tierLabel} 패키지
          </strong>
          입니다.
        </p>
      </div>

      <div className="relative mx-auto w-full max-md:px-6 md:max-w-[680px] md:px-0 lg:max-w-[1013px] lg:px-0">

        {/* 페이지 제목 — 데스크탑·태블릿만 */}
        <Image
          src={checklistHeroTitle}
          alt="체크리스트 기반 맞춤 추천이 완료되었어요!"
          className="relative mx-auto mb-10 h-auto w-full max-w-[462px] max-md:hidden"
          sizes="(min-width: 768px) 462px, 300px"
          priority
        />

        {/* 데스크탑·태블릿: 흰색 추천 카드 */}
        <div className="relative mb-14 rounded-[20px] bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.12)] max-md:hidden">
          <CardBody
            {...sharedCardProps}
            onDetailClick={navigateToDetail}
          />
        </div>

        {/* 모바일 전용: 이미지 + 패키지 정보 + 추천이유 */}
        <div className="md:hidden pt-6 mb-9">

          {/* 패키지 아이템 이미지 (모바일 전용 — 제품 상세와 동일한 hero 이미지) */}
          <div className="relative mb-5 aspect-square w-full">
            <div
              className="absolute inset-0 overflow-hidden rounded-[20px]"
              style={{ filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.12))" }}
            >
              <Image
                src={TIER_DETAIL_HERO_IMAGES[recommendedPlanTier]}
                alt={`${recommendedPkg.name} 상품 이미지`}
                fill
                className="object-cover"
                sizes="calc(100vw - 48px)"
                priority
              />
            </div>

            <PackageNutritionGuide initialTier={recommendedPlanTier} bubbleClassName="h-auto w-[100px]" />
          </div>

          {/* 패키지명 */}
          <p
            className="mb-3 text-[16px] font-extrabold leading-[19px] tracking-[-0.04em]"
            style={{ color: tierColorVar }}
          >
            {recommendedPkg.name}
          </p>

          {/* 특징 목록 + 제품 상세보기 버튼 */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <ul className="flex flex-col gap-[18px]">
              {recommendedPkg.items.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircleIcon color={tierColorVar} className="shrink-0" />
                  <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={navigateToDetail}
              disabled={!recommendedApiPlan}
              className="flex h-10 w-[108px] shrink-0 items-center justify-center rounded-[8px] text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "var(--color-brown-dark)" }}
            >
              제품 상세보기
            </button>
          </div>

          {/* 추천이유 박스 */}
          <div
            className="rounded-[20px] px-5 py-5"
            style={{ background: "var(--color-recommend-reason-bg)" }}
          >
            <h3 className="mb-4 text-[16px] font-semibold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">
              추천이유
            </h3>
            <div className="flex flex-col gap-[20px]">
              {reasons.map((reason) => (
                <div key={reason.title}>
                  <div className="mb-1 flex items-start gap-1">
                    <Image
                      src={reasonCheckIcon}
                      alt=""
                      width={16}
                      height={16}
                      className="mt-[3px] shrink-0"
                      aria-hidden
                    />
                    <span className="text-[14px] font-semibold leading-[22px] tracking-[-0.04em] text-[var(--color-recommend-reason-title)]">
                      {reason.title}
                    </span>
                  </div>
                  <p className="text-body-14-m tracking-[-0.04em] text-[var(--color-text)]">
                    {reason.content}
                  </p>
                </div>
              ))}
              <p className="text-body-16-sb tracking-[-0.04em] text-[var(--color-text)]">
                {"→ 그래서 우리 아이에게는 "}
                <span className="text-display-20-eb" style={{ color: tierColorVar }}>
                  {`'${tierLabel} 패키지'`}
                </span>
                {"를 추천드려요!"}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 하단: 전체 패키지 구독 섹션 */}
      {!plansLoading && sortedPlans.length > 0 && (
        <div className="relative mx-auto w-full max-md:px-6 md:max-w-[1013px] md:px-6 lg:px-0">
          <Image
            src={checklistLetStartPurchase}
            alt="꼬순박스 정기구독을 시작해보세요!"
            className="mx-auto mb-[48px] h-auto w-full max-w-[380px] max-md:mb-7 max-md:max-w-[260px]"
            sizes="(min-width: 768px) 380px, 260px"
          />

          <div className="flex max-md:flex-col max-md:gap-6 md:justify-between md:gap-4 lg:gap-0">
              {sortedPlans.map((plan) => {
                const tier = tierFromSubscriptionPlan(plan);
                const img = PACKAGE_SUMMARY_IMAGES[tier];
                const pkg = PACKAGES.find((p) => p.tier === tier);
                if (!pkg) return null;

                return (
                  <Link
                    key={plan.id}
                    href={`/subscribe/detail?planId=${plan.id}`}
                    className="group flex w-full bg-white transition-opacity hover:opacity-90 active:opacity-80 max-md:h-[120px] max-md:flex-row md:flex-1 md:max-w-[252px] md:flex-col md:overflow-hidden md:rounded-[16px] lg:flex-none lg:max-w-[272px]"
                  >
                    {/* 패키지 이미지 */}
                    <div className="relative overflow-hidden max-md:h-[120px] max-md:w-[128px] max-md:shrink-0 max-md:rounded-[12px] md:aspect-square md:w-full md:rounded-[16px] lg:aspect-auto lg:h-[252px]">
                      <PackageSummaryThumbnail src={img} alt={pkg.name} />
                      {tier === recommendedPlanTier && (
                        <div className="absolute left-0 top-3 max-md:h-[52px] max-md:w-[52px] md:h-[144px] md:w-[144px]">
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
                    <div className="max-md:flex max-md:flex-col max-md:justify-center max-md:py-[6px] max-md:pl-4 max-md:pr-0 md:block md:px-[18px] md:pb-[22px] md:pt-[20px]">
                      {/* 패키지명 */}
                      <p className="text-[var(--color-surface-dark)] max-md:mb-[4px] max-md:text-[16px] max-md:font-semibold max-md:leading-[19px] max-md:tracking-[-0.04em] md:mb-[12px] md:text-[20px] md:font-semibold md:leading-[24px] md:tracking-[-0.04em]">
                        {pkg.name}
                      </p>
                      {/* 할인율 + 정가(취소선) */}
                      <div className="flex items-center gap-[6px] max-md:mb-[2px] md:mb-[2px]">
                        <span
                          className="text-[14px] font-semibold leading-[17px] tracking-[-0.05em] max-md:text-[12px] max-md:leading-[15px]"
                          style={{ color: "var(--color-cta-button)" }}
                        >
                          {plan.discountRate}%
                        </span>
                        <span className="text-[var(--color-text-secondary)] line-through max-md:text-[12px] max-md:font-semibold max-md:leading-[15px] max-md:tracking-[-0.05em] md:text-[14px] md:font-semibold md:leading-[17px] md:tracking-[-0.05em]">
                          {formatMonthlyPrice(plan.originalPrice)}
                        </span>
                      </div>
                      {/* 월 요금제 + 할인가 */}
                      <div className="flex items-baseline gap-[8px] max-md:mb-[2px] md:mb-[6px]">
                        <span className="text-[var(--color-text-body-warm)] max-md:text-[13px] max-md:font-bold max-md:leading-[16px] max-md:tracking-[-0.05em] md:text-[16px] md:font-bold md:leading-[19px] md:tracking-[-0.05em]">
                          월 요금제
                        </span>
                        <span className="text-[var(--color-surface-dark)] max-md:text-[16px] max-md:font-extrabold max-md:leading-[19px] max-md:tracking-[-0.05em] md:text-[20px] md:font-extrabold md:leading-[24px] md:tracking-[-0.05em]">
                          {formatMonthlyPrice(plan.monthlyPrice)}
                        </span>
                      </div>
                      {/* 별점 */}
                      <div className="flex items-center gap-[8px]">
                        <PlanStarRating score={planRatings[plan.id] ?? 0} />
                        <span
                          className="text-[16px] font-semibold leading-[21px] tracking-[-0.02em] max-md:text-[13px] max-md:leading-[16px]"
                          style={{ color: "var(--color-cta-button)" }}
                        >
                          {(planRatings[plan.id] ?? 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
        </div>
      )}
    </section>
  );
}
