"use client";

import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Text, Button, ScrollReveal } from "@/shared/ui";
import { PACKAGES, PackageTier } from "@/widgets/subscribe/plans/ui/packageData";
import packageExplainWithBasic from "../assets/package-explain-with-basic.png";
import packageExplainWithPremium from "../assets/package-explain-with-premium.png";
import packageExplainWithStandard from "../assets/package-explain-with-standard.png";
import homePackagePlansTitle from "../assets/home-package-plans-title-02.png";
import packageImageBasic from "../assets/package-image-basic.png";
import packageImagePremium from "../assets/package-image-premium.png";
import packageImageStandard from "../assets/package-image-standard.png";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";

const ROTATION_INTERVAL_MS = 8000;

const PACKAGE_EXPLAIN_IMAGES: Array<{
  tier: PackageTier;
  src: StaticImageData;
  alt: string;
}> = [
  {
    tier: "Basic",
    src: packageExplainWithBasic,
    alt: "베이직 패키지 BOX 설명",
  },
  {
    tier: "Standard",
    src: packageExplainWithStandard,
    alt: "스탠다드 패키지 BOX 설명",
  },
  {
    tier: "Premium",
    src: packageExplainWithPremium,
    alt: "프리미엄 패키지 BOX 설명",
  },
];

const PACKAGE_SUMMARY_ORDER: PackageTier[] = ["Premium", "Basic", "Standard"];

const PACKAGE_SUMMARY_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

const PACKAGE_PRICES: Record<PackageTier, { price: string; discountRate: string }> = {
  Basic: { price: "18,000원", discountRate: "10%" },
  Standard: { price: "13,000원", discountRate: "10%" },
  Premium: { price: "23,000원", discountRate: "10%" },
};

export default function PackagePlansSection() {
  const { isLoggedIn } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const [activePackageIndex, setActivePackageIndex] = useState(0);
  const activePackage = PACKAGE_EXPLAIN_IMAGES[activePackageIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActivePackageIndex((currentIndex) => (currentIndex + 1) % PACKAGE_EXPLAIN_IMAGES.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  function handleSubscribeClick() {
    if (!isLoggedIn) {
      router.push("/login?next=/checklist");
      return;
    }
    const hasChecklist = (profile?.checklistAnswers?.length ?? 0) > 0;
    router.push(hasChecklist ? "/subscribe" : "/checklist");
  }

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-content max-md:px-5 md:px-6 lg:px-0">
        {/* 섹션 헤더 */}
        <ScrollReveal variant="fade-up">
          <Image
            src={homePackagePlansTitle}
            alt="우리 아이에게 맞는 간식 선택 후 구독하세요!"
            className="mx-auto h-auto w-full max-w-[300px] md:max-w-[352px]"
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

        <ScrollReveal variant="fade-up" delay={200}>
          <div className="flex items-stretch justify-center gap-6 max-lg:flex-col max-lg:items-center lg:gap-7">
            <div className="relative w-full max-w-[600px] overflow-hidden rounded-[22px] shadow-sm md:rounded-[28px]">
              <Image
                key={activePackage.tier}
                src={activePackage.src}
                alt={activePackage.alt}
                className="h-auto w-full transition-opacity duration-500"
                sizes="(min-width: 1200px) 600px, calc(100vw - 40px)"
                priority
              />
              <Button
                onClick={handleSubscribeClick}
                variant="primary"
                size="lg"
                className="absolute bottom-4 right-4 h-10 w-[180px] bg-[var(--color-brown-dark)] px-6 text-[14px] font-semibold leading-[150%] tracking-[-0.02em] shadow-md max-md:bottom-3 max-md:right-3 max-md:w-[150px] max-md:px-4 lg:bottom-11 lg:right-11"
              >
                제품 살펴보기
              </Button>
            </div>

            <div className="flex w-full max-w-[600px] flex-col gap-6 lg:h-[556px] lg:w-[386px] lg:max-w-none lg:shrink-0">
              {PACKAGE_SUMMARY_ORDER.map((tier) => {
                const pkg = PACKAGES.find((packageItem) => packageItem.tier === tier)!;
                const { price, discountRate } = PACKAGE_PRICES[tier];
                const img = PACKAGE_SUMMARY_IMAGES[tier];

                return (
                  <div
                    key={tier}
                    className="flex h-[132px] overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md md:h-[167px] lg:shadow-none lg:hover:shadow-sm"
                  >
                    <div className="relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl md:w-[180px]">
                      <Image
                        src={img}
                        alt={pkg.name}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 px-4 py-[18px] md:py-[25px] lg:pl-6 lg:pr-0">
                      <p className="mb-4 truncate text-[17px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text-emphasis)] md:mb-6 md:text-[20px]">
                        {pkg.name}
                      </p>
                      <p className="mb-1.5 text-[14px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)] md:text-[16px]">
                        월 요금제
                      </p>
                      <div className="mb-0.5 flex items-baseline gap-2">
                        <span
                          className="text-[14px] font-semibold leading-[19px] tracking-[-0.05em] text-[var(--color-accent-orange)] md:text-[16px]"
                        >
                          {discountRate}
                        </span>
                        <span className="text-[18px] font-extrabold leading-[24px] tracking-[-0.05em] text-[var(--color-text-emphasis)] md:text-[20px]">
                          {price}
                        </span>
                      </div>
                      <span
                        className="text-[13px] font-semibold leading-[17px] tracking-[-0.05em] text-[var(--color-accent-orange)] md:text-[14px]"
                      >
                        첫 구독 할인
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
