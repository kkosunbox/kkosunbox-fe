"use client";

import Image from "next/image";
import Link from "next/link";
import { Text, Button, ScrollReveal } from "@/shared/ui";
import logoMain from "@/shared/assets/logo-main.svg";
import heroPremiumPackage from "../assets/hero-premium-package.webp";
import heroCatchPhrase from "../assets/hero-catch-phrase.png";
import heroMainBackground from "../assets/hero-main-background.png";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden h-[280px] md:h-[537px]">
      {/* 배경 이미지 */}
      <Image
        src={heroMainBackground}
        alt="꼬순박스 히어로 배경"
        fill
        className="object-cover object-center"
        priority
      />

      {/* 콘텐츠 오버레이 */}
      <div className="relative z-10 mx-auto max-w-content h-full flex items-center px-5 md:px-0">
        <div className="flex flex-col items-start justify-center md:pl-20">
          <ScrollReveal variant="fade-up" delay={100}>
            <Image
              src={logoMain}
              alt="꼬순박스 로고"
              className="w-full max-w-[94px] md:max-w-[114px] max-h-[32px] md:max-h-[36px] mb-3 md:mb-5"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={250}>
            <Image
              src={heroCatchPhrase}
              alt="Premium Package"
              className="w-full max-w-[160px] md:max-w-[290px] h-auto mb-2 md:mb-4"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={400}>
            <Text
              variant="subtitle-20-m"
              mobileVariant="body-13-r"
              className="text-hero-subtext text-left md:text-[18px] md:leading-[21px] md:font-medium md:whitespace-nowrap mb-3"
            >
              먹는 순간 표정이 달라지는 휴먼그레이드 수제 간식 구독
            </Text>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={450}>
            <p className="text-left text-[var(--color-hero-tagline)] max-md:text-body-13-r md:text-body-14-m md:leading-[17px] md:whitespace-nowrap mb-4 md:mb-[52px]">
              #재구매율 91%, #100% 국내산 수제, #알러지 맞춤 추천
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={550}>
            <Button
              as={Link}
              href="/subscribe"
              variant="primary"
              size="lg"
              className="bg-hero-cta-bg md:w-[282px] max-md:h-[40px] max-md:px-5 max-md:text-[14px] max-md:leading-[22px] md:text-[16px] md:leading-[30px] whitespace-nowrap"
            >
              10초 진단하고 우리 아이 맞춤 추천 받기
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
