"use client";

import Image from "next/image";
import Link from "next/link";
import { Text, Button, ScrollReveal } from "@/shared/ui";
import logoMain from "@/shared/assets/logo-main.svg";
import heroItemExpanded from "../assets/hero-item-expanded.webp";
import heroPremiumPackage from "../assets/hero-premium-package.webp";

export default function HeroSection() {
  return (
    <section className="bg-[var(--color-hero-bg)] flex flex-col overflow-hidden">
      <div className="mx-auto flex flex-col md:flex-row md:h-[537px] max-w-content items-center gap-6 md:gap-0 pt-10 md:pt-0 w-full">
        {/* Left — 장식 도형 + 패키지 이미지 */}
        <ScrollReveal variant="slide-left" duration={900} className="relative order-2 md:order-1 flex flex-1 w-full items-end max-md:justify-center md:h-full">
          {/* 패키지 이미지 */}
          <div className="relative z-10 w-full max-w-[280px] md:max-w-[410px]">
            <Image
              src={heroItemExpanded}
              alt="꼬순박스 프리미엄 패키지"
              className="h-auto w-full"
              priority
            />
          </div>
        </ScrollReveal>

        {/* Right — 텍스트 + CTA */}
        <div className="order-1 md:order-2 flex flex-1 w-full flex-col items-center md:items-start md:justify-center md:h-full md:pl-20">
          <ScrollReveal variant="fade-up" delay={100}>
            {/* 꼬순박스 로고 */}
            <Image
              src={logoMain}
              alt="꼬순박스 로고"
              className="w-full max-w-[94px] md:max-w-[114px] max-h-[32px] md:max-h-[36px] mb-4 md:mb-5"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={250}>
            {/* Premium Package 이미지 타이틀 */}
            <Image
              src={heroPremiumPackage}
              alt="Premium Package"
              className="w-full max-w-[203px] md:max-w-[274px] h-auto mb-2 md:mb-4"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={400}>
            <Text
              variant="subtitle-20-sb"
              mobileVariant="body-14-m"
              className="text-primary text-center md:text-left mb-4 md:mb-7"
            >
              100% 국내산 휴먼그레이드 수제간식 구독
            </Text>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={550}>
            <Button
              as={Link}
              href="/subscribe"
              variant="primary"
              size="lg"
              className="max-md:h-[44px] max-md:px-6 max-md:text-[16px] max-md:leading-[24px] whitespace-nowrap"
            >
              구독하러 가기
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
