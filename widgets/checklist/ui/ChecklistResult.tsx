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
          <p
            className="text-[16px] leading-[150%] tracking-[-0.02em] text-black"
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
            className="mb-[28px] text-[20px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text)]"
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
        <p
          className="text-[14px] leading-[150%] tracking-[-0.02em] text-[var(--color-text)]"
          style={{ fontFamily: GRIUN_FONT }}
        >
          체크리스트 분석 완료!{" "}
          <strong className="font-semibold">{petName}</strong>에게 꼭 필요한 영양만 꽉 채운{" "}
          <strong className="font-semibold">{tierLabel} 패키지</strong>입니다.
        </p>
      </div>

      <div className="relative mx-auto w-full max-md:px-6 md:max-w-[1013px] md:px-0 lg:px-0">

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
            <div className="flex flex-col gap-[18px]">
              {reasons.map((reason) => (
                <div key={reason.title}>
                  <p className="mb-[6px] text-[14px] font-semibold leading-[22px] tracking-[-0.04em] text-[var(--color-primary)]">
                    <span className="font-semibold text-black">✔</span> {reason.title}
                  </p>
                  <p className="indent-[1em] text-[14px] font-medium leading-[22px] tracking-[-0.04em] text-[var(--color-text)]">
                    {reason.description}
                  </p>
                </div>
              ))}
              <p className="text-[14px] font-semibold leading-[22px] tracking-[-0.04em] text-[var(--color-text)]">
                {"→ 그래서 우리 아이에게는 "}
                <span style={{ color: tierColorVar }}>{`'${tierLabel} 패키지'`}</span>
                {"를 추천드려요!"}
              </p>
            </div>
          </div>
        </div>

        {/* 하단: 전체 패키지 구독 섹션 */}
        {!plansLoading && sortedPlans.length > 0 && (
          <div>
            <Image
              src={checklistLetStartPurchase}
              alt="꼬순박스 정기구독을 시작해보세요!"
              className="mx-auto mb-[48px] h-auto w-full max-w-[380px] max-md:mb-7 max-md:max-w-[260px]"
              sizes="(min-width: 768px) 380px, 260px"
            />

            <div className="flex justify-between max-md:flex-col max-md:gap-6">
              {sortedPlans.map((plan) => {
                const tier = tierFromSubscriptionPlan(plan);
                const img = PACKAGE_SUMMARY_IMAGES[tier];
                const pkg = PACKAGES.find((p) => p.tier === tier);
                if (!pkg) return null;

                return (
                  <Link
                    key={plan.id}
                    href={`/subscribe/detail?planId=${plan.id}`}
                    className="group flex w-full bg-white transition-opacity hover:opacity-90 active:opacity-80 max-md:h-[120px] max-md:flex-row md:max-w-[272px] md:flex-col md:overflow-hidden md:rounded-[16px]"
                  >
                    {/* 패키지 이미지 */}
                    <div className="relative overflow-hidden max-md:h-[120px] max-md:w-[128px] max-md:shrink-0 max-md:rounded-[12px] md:h-[252px] md:w-full">
                      <Image
                        src={img}
                        alt={pkg.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 768px) 272px, 128px"
                      />
                      {tier === recommendedPlanTier && (
                        <div className="absolute bottom-3 right-3 max-md:h-[52px] max-md:w-[52px] md:h-[144px] md:w-[144px]">
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
                      <p className="text-[var(--color-surface-dark)] max-md:mb-[6px] max-md:text-[16px] max-md:font-semibold max-md:leading-[19px] max-md:tracking-[-0.04em] md:mb-[12px] md:text-[20px] md:font-bold md:leading-[24px] md:tracking-[-0.04em]">
                        {pkg.name}
                      </p>
                      <p className="text-[var(--color-text-body-warm)] max-md:mb-[4px] max-md:text-[16px] max-md:font-bold max-md:leading-[19px] max-md:tracking-[-0.05em] md:mb-[6px] md:text-[16px] md:font-bold md:leading-[19px] md:tracking-[-0.05em]">
                        월 요금제
                      </p>
                      <div className="flex items-baseline gap-[8px] max-md:mb-[2px] md:mb-[4px]">
                        <span
                          className="max-md:text-[16px] max-md:font-semibold max-md:leading-[19px] max-md:tracking-[-0.05em] md:text-[16px] md:font-semibold md:leading-[19px] md:tracking-[-0.05em]"
                          style={{ color: pkg.colorVar }}
                        >
                          {plan.discountRate}%
                        </span>
                        <span className="text-[var(--color-surface-dark)] max-md:text-[20px] max-md:font-extrabold max-md:leading-[24px] max-md:tracking-[-0.05em] md:text-[20px] md:font-extrabold md:leading-[24px] md:tracking-[-0.05em]">
                          {formatMonthlyPrice(plan.monthlyPrice)}
                        </span>
                      </div>
                      <p
                        className="max-md:text-[14px] max-md:font-semibold max-md:leading-[17px] max-md:tracking-[-0.05em] md:text-[14px] md:font-semibold md:leading-[17px] md:tracking-[-0.05em]"
                        style={{ color: pkg.colorVar }}
                      >
                        첫 구독 할인
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
