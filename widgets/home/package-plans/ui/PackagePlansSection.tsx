"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Text, ScrollReveal, CheckCircleIcon } from "@/shared/ui";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import {
  PACKAGES,
  tierFromSubscriptionPlan,
  TIER_DETAIL_HERO_IMAGES,
  PackageNutritionGuide,
  type PackageTier,
} from "@/entities/package";
import { getSubscriptionPlans } from "@/features/subscription/api";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import { PlanPicker, PlanTierDots } from "@/widgets/package-plans";
import homePackagePlansTitle from "../assets/home-package-plans-title-02.webp";

const HOME_SUMMARY_ORDER: PackageTier[] = ["Premium", "Basic", "Standard"];

export default function PackagePlansSection() {
  const router = useRouter();
  const [apiPlans, setApiPlans] = useState<SubscriptionPlanDto[]>([]);
  const [plansReady, setPlansReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    getSubscriptionPlans()
      .then((res) => { setApiPlans(res.plans); setPlansReady(true); })
      .catch(() => { setPlansReady(true); });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className={`bg-white py-12 md:py-24 lg:py-20 transition-[border-radius] duration-300 ${scrolled ? "rounded-t-[24px]" : ""}`}>
      <div className="mx-auto max-w-content max-md:px-5 md:px-6 lg:px-0">
        {/* 섹션 헤더 */}
        <ScrollReveal variant="fade-up">
          <Image
            src={homePackagePlansTitle}
            alt="우리 아이에게 맞는 간식 선택 후 구독하세요!"
            quality={HIGH_IMAGE_QUALITY}
            className="mx-auto max-lg:h-[64px] max-lg:w-auto lg:h-auto lg:w-full lg:max-w-[352px]"
            sizes="(min-width: 768px) 352px, 300px"
            priority
          />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={150}>
          <Text
            variant="subtitle-18-m"
            mobileVariant="body-14-m"
            className="mt-4 mb-10 md:mb-12 lg:mb-14 text-center text-[var(--color-text-warm)] max-md:leading-[20px]"
          >
            체크리스트 후 우리 아이에게 적절한{" "}
            <br className="md:hidden lg:hidden" />
            패키지 박스를 추천받을 수 있습니다!
          </Text>
        </ScrollReveal>

        <PlanPicker
          plans={apiPlans}
          plansReady={plansReady}
          summaryOrder={HOME_SUMMARY_ORDER}
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
                  </div>
                  <PackageNutritionGuide initialTier={tier} bubbleClassName="h-auto w-[100px]" />
                </div>
                {activePkg ? (
                  <div className="mt-4">
                    <p
                      className="text-subtitle-17-b-lh22"
                      style={{ color: activePkg.colorVar }}
                    >
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
