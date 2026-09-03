"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Text, ScrollReveal } from "@/shared/ui";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { getSubscriptionPlans } from "@/features/subscription/api";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import { useReferral } from "@/features/referral/model";
import homePackagePlansTitle from "../assets/home-package-plans-title-02.webp";
import HomePlanCards from "./HomePlanCards";

export default function PackagePlansSection() {
  const [apiPlans, setApiPlans] = useState<SubscriptionPlanDto[]>([]);
  const [plansReady, setPlansReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { refCode } = useReferral();

  useEffect(() => {
    getSubscriptionPlans(undefined, refCode ?? undefined)
      .then((response) => {
        setApiPlans(response.plans);
        setPlansReady(true);
      })
      .catch(() => {
        setPlansReady(true);
      });
  }, [refCode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className={`bg-white pt-16 pb-16 transition-[border-radius] duration-300 md:py-24 lg:pt-[76px] lg:pb-24 ${
        scrolled ? "rounded-t-[24px]" : ""
      }`}
    >
      <div className="mx-auto max-w-content max-md:px-5 md:px-6 lg:px-0">
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
            mobileVariant="body-13-m"
            className="mt-5 text-center text-[var(--color-text-warm)] max-md:leading-[20px]"
          >
            체크리스트 후 우리 아이에게 적절한{" "}
            <br className="md:hidden lg:hidden" />
            패키지 박스를 추천받을 수 있습니다!
          </Text>
        </ScrollReveal>
      </div>

      <div className="mt-12 lg:mt-[52px]">
        <HomePlanCards plans={apiPlans} plansReady={plansReady} />
      </div>
    </section>
  );
}
