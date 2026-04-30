"use client";

import Image from "next/image";
import Link from "next/link";
import { Text, Button, ScrollReveal } from "@/shared/ui";
import logoMain from "@/shared/assets/logo-main.svg";
import heroPremiumPackage from "../assets/hero-premium-package.webp";
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
              src={heroPremiumPackage}
              alt="Premium Package"
              className="w-full max-w-[160px] md:max-w-[274px] h-auto mb-2 md:mb-4"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={400}>
            <Text
              variant="subtitle-20-sb"
              mobileVariant="body-13-r"
              className="text-primary text-left mb-4 md:mb-7"
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
              className="max-md:h-[40px] max-md:px-5 max-md:text-[14px] max-md:leading-[22px] whitespace-nowrap"
            >
              구독하러 가기
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
