"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircleIcon } from "@/shared/ui";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import {
  PACKAGES,
  tierFromSubscriptionPlan,
  TIER_DETAIL_HERO_IMAGES,
  PackageNutritionGuide,
} from "@/entities/package";
import { getSubscriptionPlans } from "@/features/subscription/api";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import { useReferral } from "@/features/referral/model";
import { PlanTierDots } from "@/widgets/package-plans";
import ReferralPlanPicker from "./ReferralPlanPicker";
import { ReferralAdditionalDiscountChip } from "@/features/referral/ui";
import NimIRecommendSvg from "./NimIRecommendSvg";
import ReferralTitleSvg from "./ReferralTitleSvg";

export default function ReferralPackagePlansSection() {
  const router = useRouter();
  const { influencerName, discountRate } = useReferral();
  const [apiPlans, setApiPlans] = useState<SubscriptionPlanDto[]>([]);
  const [plansReady, setPlansReady] = useState(false);

  useEffect(() => {
    getSubscriptionPlans()
      .then((res) => { setApiPlans(res.plans); setPlansReady(true); })
      .catch(() => { setPlansReady(true); });
  }, []);

  const additionalDiscountPct = Math.round(discountRate * 100);

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-content max-md:px-5 md:px-6 lg:px-0">
        {/* 섹션 헤더 */}
        <div className="mb-8 text-center md:mb-10 lg:mb-12">
          {/* Row 1: [인플루언서이름] + 님이 추천하는 꼬순박스 SVG */}
          <div className="flex items-center justify-center gap-2">
            <span
              className="translate-y-[6px] max-md:text-[22px] text-[32px] font-bold leading-[1.5] tracking-[-0.04em] text-[var(--color-text-discount)]"
              style={{ fontFamily: "var(--font-gmarket-sans)" }}
            >
              [{influencerName}]
            </span>
            <NimIRecommendSvg className="max-md:h-[18px] h-[26px] w-auto max-w-[233px]" />
          </div>
          {/* Row 2: 전용 할인 받고 구독 시작하세요! SVG */}
          <ReferralTitleSvg className="mt-2 w-full max-md:max-w-[320px] max-w-[469px] h-auto mx-auto" />
          {/* Row 3: 지금 구독하면... */}
          <p className="mt-6 max-md:text-body-13-r text-body-18-m text-[var(--color-text-on-warm)]">
            체크리스트 후 우리 아이에게 적절한 패키지 박스를 추천받을 수 있습니다!
          </p>
        </div>

        <ReferralPlanPicker
          plans={apiPlans}
          plansReady={plansReady}
          getPrimaryButton={(plan) => ({
            label: "제품 상세보기",
            onClick: () => router.push(`/subscribe/detail?planId=${plan.id}`),
          })}
          mobileSlot={(tier, onTierSelect, order) => {
            const activePkg = PACKAGES.find((p) => p.tier === tier);
            const activePlan = apiPlans.find((p) => tierFromSubscriptionPlan(p) === tier);
            return (
              <>
                <div
                  className="relative w-full rounded-[22px]"
                  style={{ boxShadow: "var(--shadow-card-soft)" }}
                >
                  <div
                    className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-white"
                    onClick={() => {
                      if (activePlan) router.push(`/subscribe/detail?planId=${activePlan.id}`);
                    }}
                    style={{ cursor: activePlan ? "pointer" : undefined }}
                  >
                    {(["Premium", "Standard", "Basic"] as const).map((t) => {
                      const tPkg = PACKAGES.find((p) => p.tier === t);
                      return (
                        <Image
                          key={t}
                          src={TIER_DETAIL_HERO_IMAGES[t]}
                          alt={`${tPkg?.name ?? t} 대표 이미지`}
                          fill
                          quality={HIGH_IMAGE_QUALITY}
                          className="object-cover"
                          sizes="100vw"
                          priority={t === "Premium"}
                          style={{
                            opacity: tier === t ? 1 : 0,
                            filter: tier === t ? "blur(0px)" : "blur(6px)",
                            transition: "opacity 350ms ease, filter 350ms ease",
                          }}
                        />
                      );
                    })}
                    <ReferralAdditionalDiscountChip
                      pct={additionalDiscountPct}
                      className="left-3 top-3"
                    />
                  </div>
                  <PackageNutritionGuide initialTier={tier} bubbleClassName="h-auto w-[100px]" />
                </div>
                {activePkg ? (
                  <div className="mt-4">
                    <p className="text-subtitle-17-b-lh22" style={{ color: activePkg.colorVar }}>
                      {activePkg.name}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <ul className="min-w-0 flex-1 flex flex-col gap-2">
                        {activePkg.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-body-13-m leading-[18px] text-[var(--color-text)]"
                          >
                            <CheckCircleIcon color={activePkg.colorVar} className="mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => {
                          if (activePlan) router.push(`/subscribe/detail?planId=${activePlan.id}`);
                        }}
                        disabled={!activePlan}
                        className="flex h-10 w-[108px] shrink-0 items-center justify-center self-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-center text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        제품 상세보기
                      </button>
                    </div>
                  </div>
                ) : null}
                <PlanTierDots tier={tier} order={order} onTierSelect={onTierSelect} />
              </>
            );
          }}
        />
      </div>
    </section>
  );
}
