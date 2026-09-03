"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@/shared/ui";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import {
  PACKAGES,
  PackageNutritionGuide,
  resolveRecommendedPlanIds,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "@/entities/package";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import { planDisplayPrice } from "@/features/subscription/lib/planDisplayPrice";
import { trackSelectItem } from "@/shared/lib/analytics";
import basicImage from "../assets/package-image-basic.webp";
import standardImage from "../assets/package-image-standard.webp";
import premiumImage from "../assets/package-image-premium.webp";

const HOME_PLAN_ORDER: PackageTier[] = ["Basic", "Standard", "Premium"];

const HOME_PLAN_IMAGES = {
  Basic: basicImage,
  Standard: standardImage,
  Premium: premiumImage,
} satisfies Record<PackageTier, typeof basicImage>;

const HOME_PLAN_FEATURES: Record<PackageTier, readonly string[]> = {
  Basic: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
  Standard: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
  Premium: ["특별한 날을 위한 최고급 구성", "고급 재료 프리미엄 간식", "맞춤 구성 + 화식 포함"],
};

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

interface HomePlanCardsProps {
  plans: SubscriptionPlanDto[];
  plansReady: boolean;
}

export default function HomePlanCards({ plans, plansReady }: HomePlanCardsProps) {
  const router = useRouter();
  const recommendedPlanIds = resolveRecommendedPlanIds(plans);

  return (
    <div className="mx-auto max-lg:flex max-lg:w-full max-lg:snap-x max-lg:snap-mandatory max-lg:items-end max-lg:gap-5 max-lg:overflow-x-auto max-lg:px-5 max-lg:pb-5 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden lg:grid lg:w-[1061px] lg:grid-cols-3 lg:items-end lg:gap-10">
      {HOME_PLAN_ORDER.map((tier) => {
        const pkg = PACKAGES.find((item) => item.tier === tier)!;
        const plan = plans.find((item) => tierFromSubscriptionPlan(item) === tier);
        const price = plan ? planDisplayPrice(plan) : null;
        const isRecommended = plan
          ? recommendedPlanIds.has(plan.id)
          : tier === "Standard";

        return (
          <article
            key={tier}
            aria-labelledby={`home-plan-${tier}`}
            className={`relative shrink-0 snap-center rounded-[20px] max-lg:w-[300px] lg:w-[327px] ${
              isRecommended
                ? "max-lg:h-[582px] lg:h-[604px] bg-[var(--color-cta-button)] pt-[34px] shadow-[var(--shadow-card-selected)]"
                : "max-lg:h-[548px] lg:h-[570px] bg-white shadow-[var(--shadow-card-soft)]"
            }`}
          >
            {isRecommended ? (
              <div className="absolute inset-x-0 top-0 flex h-[34px] items-center justify-center text-[14px] font-bold leading-[17px] tracking-[-0.02em] text-white">
                인기 Pick
              </div>
            ) : null}

            <div
              className={`flex h-full flex-col overflow-hidden rounded-[20px] ${
                isRecommended
                  ? "border-2 border-[var(--color-cta-button)] bg-[linear-gradient(180deg,var(--color-accent-orange-light)_43%,white_78%)]"
                  : "bg-white"
              }`}
            >
              <div className="relative aspect-[327/251] w-full shrink-0 overflow-hidden rounded-t-[18px]">
                <Image
                  src={HOME_PLAN_IMAGES[tier]}
                  alt={`${pkg.name} 대표 이미지`}
                  fill
                  quality={HIGH_IMAGE_QUALITY}
                  className="object-cover"
                  sizes="(min-width: 1200px) 327px, 300px"
                />
                <PackageNutritionGuide initialTier={tier} bubbleClassName="hidden" />
              </div>

              <div className="flex min-h-0 flex-1 flex-col px-7 pt-5 pb-[26px]">
                <h3
                  id={`home-plan-${tier}`}
                  className="text-[20px] font-bold leading-6 tracking-[-0.04em] text-[var(--color-text)]"
                >
                  {pkg.name}
                </h3>

                <ul className="mt-4 flex flex-col gap-[10px]">
                  {HOME_PLAN_FEATURES[tier].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-[13px] font-medium leading-4 text-[var(--color-text)]"
                    >
                      <CheckCircleIcon color={pkg.colorVar} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex min-h-[50px] items-center justify-between gap-4">
                  <span className="text-[16px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)]">
                    월 요금제
                  </span>
                  {price ? (
                    <div className="flex flex-col items-end">
                      {price.strikePrice ? (
                        <div className="flex items-center gap-2 text-[16px] font-semibold leading-[19px] tracking-[-0.05em]">
                          {price.discountPct ? (
                            <span className="text-[var(--color-text-discount)]">
                              {price.discountPct}%
                            </span>
                          ) : null}
                          <span className="text-[var(--color-text-secondary)] line-through">
                            {formatPrice(price.strikePrice)}
                          </span>
                        </div>
                      ) : null}
                      <strong className="text-[20px] font-extrabold leading-6 tracking-[-0.05em] text-[var(--color-text-price)]">
                        {formatPrice(price.price)}
                      </strong>
                    </div>
                  ) : (
                    <div
                      className={`h-10 w-[100px] rounded-lg bg-[var(--color-surface-light)] ${
                        plansReady ? "" : "animate-pulse"
                      }`}
                      aria-label={plansReady ? "판매 준비 중" : "요금 불러오는 중"}
                    />
                  )}
                </div>

                <button
                  type="button"
                  disabled={!plan}
                  onClick={() => {
                    if (!plan) return;
                    trackSelectItem({ plan_tier: plan.name });
                    router.push(`/subscribe/detail?planId=${plan.id}`);
                  }}
                  className="mt-[22px] flex h-12 w-full items-center justify-center rounded-[12px] bg-[var(--color-cta-button)] text-[16px] font-semibold leading-6 tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  상세보기
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
