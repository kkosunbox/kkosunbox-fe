"use client";

/* eslint-disable @next/next/no-img-element -- 프로필 이미지는 서버의 동적 원격 URL이다. */
import { useEffect, useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  PACKAGES,
  PACKAGE_SUMMARY_IMAGES,
  PackageSummaryThumbnail,
  PlanRatingStars,
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "@/entities/package";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import type { RecommendReasonDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import { trackChecklistCtaClick } from "@/shared/lib/analytics";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { FallbackAvatar, useModal } from "@/shared/ui";
import basicImage from "@/widgets/checklist/assets/checklist-result-basic.png";
import checklistResultBannerImage from "@/widgets/checklist/assets/checklist-result-banner.png";
import premiumImage from "@/widgets/checklist/assets/checklist-result-premium.png";
import standardImage from "@/widgets/checklist/assets/checklist-result-standard.png";
import type { PetInfo, RecommendedTier } from "./types";

const RESULT_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: basicImage,
  Standard: standardImage,
  Premium: premiumImage,
};

const TIER_LABEL: Record<RecommendedTier, string> = {
  basic: "베이직",
  standard: "스탠다드",
  premium: "프리미엄",
};

const DEFAULT_REASONS: Record<RecommendedTier, RecommendReasonDto[]> = {
  basic: [
    { title: "간식 루틴을 가볍게 시작해요", content: "우리 아이가 좋아할 기본 인기 간식을 부담 없이 경험할 수 있어요." },
    { title: "기호성을 차근차근 발견해요", content: "다양한 식감과 재료를 맛보며 우리 아이의 취향을 알아갈 수 있어요." },
    { title: "알러지를 세심하게 고려해요", content: "체크리스트에 남긴 정보를 바탕으로 피해야 할 식재료를 살펴 구성해요." },
  ],
  standard: [
    { title: "인기 간식과 특별 간식을 함께 즐겨요", content: "익숙한 즐거움과 새로운 맛을 균형 있게 경험할 수 있어요." },
    { title: "기호성과 영양을 고르게 챙겨요", content: "맛있는 간식 시간은 물론 일상에 필요한 영양까지 함께 고려했어요." },
    { title: "우리 아이의 취향을 반영해요", content: "체크리스트 결과를 바탕으로 더 잘 먹는 재료와 식감을 찾아 구성해요." },
  ],
  premium: [
    { title: "다양한 간식을 좋아해요", content: "한 가지 간식보다 다양한 맛과 식감을 경험하는 타입이에요. 매달 새로운 수제 간식으로 즐거운 간식 시간을 만들 수 있어요." },
    { title: "새로운 맛에 대한 호기심이 높아요", content: "새로운 간식에도 거부감 없이 잘 적응하는 편이라 여러 종류를 경험할수록 만족도가 높아질 가능성이 커요." },
    { title: "건강 관리가 필요한 시기예요", content: "맛뿐 아니라 건강까지 함께 챙기는 것이 중요해요. 건강한 원재료를 바탕으로 더욱 안심하고 급여할 수 있어요." },
  ],
};

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function getAgeLabel(birthDate: Date | null) {
  if (!birthDate) return "나이 정보 없음";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassed = today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayPassed) age -= 1;
  return `${Math.max(age, 0)}살`;
}

function ResultAvatar({ src, userId, size }: { src: string | null; userId?: number | null; size: number }) {
  if (src) return <img src={src} alt="반려견 프로필" className="h-full w-full object-cover" />;
  return <FallbackAvatar userId={userId} size={size} className="h-full w-full" />;
}

function RetryButton() {
  const { openAlert } = useModal();
  return (
    <button
      type="button"
      onClick={() => openAlert({
        title: "체크리스트를 다시 진행하시겠습니까?",
        description: "처음부터 다시 작성할 수 있습니다.\n기존에 작성한 결과는 삭제되지 않습니다.",
        primaryLabel: "다시하기",
        onPrimary: () => openChecklistForm({ rewrite: true }),
        secondaryLabel: "취소하기",
      })}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--color-text-muted)] px-3 text-body-13-m text-[var(--color-text-label)] transition-colors hover:bg-[var(--color-surface-warm)]"
    >
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M9 8 12 5.5 9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15.1 8.1a5.8 5.8 0 1 1-5.1-2.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      다시하기
    </button>
  );
}

function ResultBanner() {
  return (
    <div className="flex h-[70px] items-center justify-center overflow-hidden bg-[var(--color-purchase-banner-bg)] px-6 text-white">
      <div className="flex h-full items-center gap-5 max-md:gap-3">
        <p className="text-subtitle-16-sb max-md:text-body-13-sb">
          우리 아이 취향저격 <strong className="text-[var(--color-banner-bg)]">꼬순박스 완성하기</strong>
        </p>
        <Image
          src={checklistResultBannerImage}
          alt=""
          width={106}
          height={63}
          aria-hidden
          className="shrink-0 self-end"
        />
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  petInfo: PetInfo;
  avatarSrc: string | null;
  userId?: number | null;
  packageTier: PackageTier;
  tierLabel: string;
  reasons: RecommendReasonDto[];
  onDetail: () => void;
  detailHref: string | null;
}

function RecommendationCard({ petInfo, avatarSrc, userId, packageTier, tierLabel, reasons, onDetail, detailHref }: RecommendationCardProps) {
  const petName = petInfo.name.trim() || "우리 아이";
  const metadata = [getAgeLabel(petInfo.birthDate), petInfo.breed, petInfo.specialNotes].filter(Boolean).join(" · ");
  return (
    <article className="grid gap-6 rounded-[20px] bg-white p-9 shadow-[0_8px_24px_2px_rgba(0,0,0,0.16)] max-lg:p-6 lg:grid-cols-[minmax(0,643px)_minmax(0,1fr)] lg:gap-[44px]">
      <div className="relative min-h-[300px] overflow-hidden rounded-[20px] max-md:h-[260px] max-md:min-h-0 lg:h-[483px]">
        <Image src={RESULT_IMAGES[packageTier]} alt={`${tierLabel} 패키지 구성`} fill priority sizes="(min-width: 1200px) 643px, calc(100vw - 96px)" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-col lg:py-1">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--color-text-muted)]">
            <ResultAvatar src={avatarSrc} userId={userId} size={64} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-subtitle-20-b text-[var(--color-text)]">{petName}</p>
            <p className="mt-1 truncate text-body-14-r text-[var(--color-text-secondary)]">{metadata}</p>
          </div>
          <RetryButton />
        </div>
        <h2 className="mt-5 text-[20px] font-semibold leading-[1.45] tracking-[-0.04em] text-[var(--color-text)] max-md:text-[18px]">
          {petName}에게는<br className="max-md:hidden" /> <strong className="text-[var(--color-cta-button)]">{tierLabel} 패키지 BOX</strong>를 추천드려요!
        </h2>
        <div className="mt-5 flex-1 rounded-[20px] bg-[var(--color-recommend-reason-bg)] px-5 py-4">
          <ul className="space-y-3.5">
            {reasons.slice(0, 3).map((reason) => (
              <li key={reason.title}>
                <p className="text-body-16-sb text-[var(--color-recommend-reason-title)]">
                  <span className="text-[var(--color-text)]" aria-hidden>✓ </span>
                  {reason.title}
                </p>
                <p className="mt-0.5 text-body-13-r leading-5 text-[var(--color-text)]">{reason.content}</p>
              </li>
            ))}
          </ul>
        </div>
        {detailHref ? (
          <Link href={detailHref} onClick={onDetail} className="mt-5 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-[var(--color-cta-button)] text-subtitle-16-b text-white transition-opacity hover:opacity-90">
            제품 상세보기
          </Link>
        ) : (
          <button type="button" disabled className="mt-5 h-[52px] w-full cursor-not-allowed rounded-[10px] bg-[var(--color-cta-button)] text-subtitle-16-b text-white opacity-50">
            제품 상세보기
          </button>
        )}
      </div>
    </article>
  );
}

function PackageCard({ plan }: { plan: SubscriptionPlanDto }) {
  const tier = tierFromSubscriptionPlan(plan);
  const pkg = PACKAGES.find((item) => item.tier === tier);
  if (!pkg) return null;
  return (
    <Link href={`/subscribe/detail?planId=${plan.id}`} className="group relative flex min-h-[180px] gap-6 rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-1 max-md:min-h-0 max-md:gap-4 max-md:p-4">
      {tier === "Standard" && <span className="absolute left-6 top-6 z-10 rounded-br-[8px] rounded-tl-[12px] bg-[var(--color-surface-dark)] px-3 py-1 text-body-12-sb text-white">인기 PICK ✨</span>}
      <div className="relative h-[132px] w-[146px] shrink-0 overflow-hidden rounded-[12px] max-md:h-[108px] max-md:w-[120px]">
        <PackageSummaryThumbnail
          src={PACKAGE_SUMMARY_IMAGES[tier]}
          alt={`${pkg.name} 박스 이미지`}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-subtitle-16-b text-[var(--color-text)]">{pkg.name}</p>
        {plan.discountRate ? <p className="mt-3 text-body-14-sb"><span className="text-[var(--color-cta-button)]">{plan.discountRate}%</span> <span className="ml-1 text-[var(--color-text-secondary)] line-through">{formatPrice(plan.originalPrice ?? plan.monthlyPrice)}</span></p> : null}
        <p className="mt-2 text-body-14-b text-[var(--color-text-body-warm)]">월 요금제 <strong className="ml-2 text-subtitle-18-b text-[var(--color-surface-dark)]">{formatPrice(plan.monthlyPrice)}</strong></p>
        {plan.averageRating > 0 ? <div className="mt-2"><PlanRatingStars rating={plan.averageRating} size={16} /></div> : null}
      </div>
    </Link>
  );
}

interface Props {
  petInfo: PetInfo;
  avatarSrc: string | null;
  userId?: number | null;
  recommendedTier: RecommendedTier;
  profileId?: number | null;
}

export default function ChecklistResult({ petInfo, avatarSrc, userId, recommendedTier, profileId }: Props) {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [apiReasons, setApiReasons] = useState<RecommendReasonDto[]>([]);
  const [loading, setLoading] = useState(profileId != null);

  useEffect(() => {
    if (profileId == null) return;
    let cancelled = false;
    getSubscriptionPlans(profileId)
      .then((response) => {
        if (cancelled) return;
        setPlans(response.plans);
        setApiReasons(response.recommendReasons ?? []);
      })
      .catch(() => { if (!cancelled) setPlans([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [profileId]);

  const sortedPlans = useMemo(() => [...plans].sort(comparePlansForDisplayOrder), [plans]);
  const apiRecommendedPlan = sortedPlans.find((plan) => plan.isRecommended);
  const effectiveTier = apiRecommendedPlan
    ? packageThemeForPlan(apiRecommendedPlan).tier.toLowerCase() as RecommendedTier
    : recommendedTier;
  const packageTier = `${effectiveTier.charAt(0).toUpperCase()}${effectiveTier.slice(1)}` as PackageTier;
  const recommendedPlan = sortedPlans.find((plan) => tierFromSubscriptionPlan(plan) === packageTier);
  const reasons = apiReasons.length ? apiReasons : DEFAULT_REASONS[effectiveTier];
  const tierLabel = TIER_LABEL[effectiveTier];

  const showDetail = () => {
    if (!recommendedPlan) return;
    trackChecklistCtaClick({ plan_tier: recommendedPlan.name });
  };

  return (
    <section className="bg-white pt-[var(--header-offset)]">
      <ResultBanner />
      <div className="bg-[linear-gradient(180deg,var(--color-background)_66%,var(--color-recommend-reason-bg)_100%)] pb-[88px] pt-10 max-md:pb-14 max-md:pt-8">
        <div className="mx-auto w-full max-w-[1288px] px-6">
          <header className="mb-10 max-md:mb-7">
            <h1 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] text-[var(--color-why-choose-text)] max-md:text-[23px]">
              체크리스트 기반 <span className="text-[var(--color-cta-button)]">맞춤 추천</span>이 완료되었어요!
            </h1>
            <p className="mt-3 text-body-16-r text-[var(--color-text-body-warm)]">우리 아이에게 딱 맞는 꼬순박스를 추천드려요.</p>
          </header>
          <div className="relative">
            <RecommendationCard petInfo={petInfo} avatarSrc={avatarSrc} userId={userId} packageTier={packageTier} tierLabel={tierLabel} reasons={reasons} onDetail={showDetail} detailHref={recommendedPlan ? `/subscribe/detail?planId=${recommendedPlan.id}` : null} />
            {loading ? <div className="absolute inset-0 animate-pulse rounded-[20px] bg-[var(--color-surface-warm)] opacity-70" aria-label="추천 결과 불러오는 중" /> : null}
          </div>
          <div className="mt-[76px] max-md:mt-12">
            <h2 className="text-[28px] font-bold tracking-[-0.04em] text-[var(--color-why-choose-text)] max-md:text-[23px]">다른 <span className="text-[var(--color-cta-button)]">꼬순박스</span>들도 살펴보세요.</h2>
            <p className="mt-3 text-body-16-r text-[var(--color-text-body-warm)]">꼬순박스의 정기구독 상품을 소개합니다.</p>
            {sortedPlans.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-3">
                {sortedPlans.map((plan) => <PackageCard key={plan.id} plan={plan} />)}
              </div>
            ) : !loading ? (
              <p className="mt-10 rounded-[20px] bg-white p-8 text-center text-body-14-r text-[var(--color-text-secondary)] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">상품 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
