"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Text, Button, ScrollReveal } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import logoMain from "@/shared/assets/logo-main.svg";
import heroCatchPhrase from "../assets/hero-catch-phrase.png";
import heroCatchPhraseMobile from "../assets/hero-catch-phrase-mobile.png";
import heroMainBackground from "../assets/hero-main-background.png";
import heroMainBackgroundMobile from "../assets/hero-main-background-mobile-expanded.png";

export default function HeroSection() {
  const { isLoggedIn } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();

  function handleChecklistCtaClick() {
    if (!isLoggedIn) {
      router.push("/login?next=/checklist");
      return;
    }
    const hasChecklist = (profile?.checklistAnswers?.length ?? 0) > 0;
    if (hasChecklist) {
      router.push("/subscribe");
      return;
    }
    router.push("/checklist");
  }

  return (
    <section className="relative overflow-hidden max-lg:h-[585px] lg:h-[537px]">
      {/* 모바일/태블릿 배경 이미지 */}
      <div className="lg:hidden absolute inset-0 flex justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroMainBackgroundMobile.src}
          alt=""
          aria-hidden="true"
          className="h-full w-auto max-w-none shrink-0"
          fetchPriority="high"
        />
      </div>
      {/* 데스크톱 배경 이미지 */}
      <Image
        src={heroMainBackground}
        alt="꼬순박스 히어로 배경"
        fill
        className="object-cover object-bottom max-lg:hidden"
        priority
      />

      {/* 콘텐츠 오버레이 */}
      <div className="relative z-10 mx-auto max-w-content h-full flex max-lg:items-start lg:items-center max-lg:justify-center max-lg:pt-[43px] max-lg:px-5 lg:px-0">
        <div className="flex flex-col max-lg:items-center lg:items-start justify-center lg:pl-20">
          <ScrollReveal variant="fade-up" delay={100}>
            <Image
              src={logoMain}
              alt="꼬순박스 로고"
              className="w-full max-lg:max-w-[158px] lg:max-w-[114px] max-lg:max-h-[54px] lg:max-h-[36px] max-lg:mb-3 lg:mb-5"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={250}>
            {/* 데스크톱 캐치프레이즈 */}
            <Image
              src={heroCatchPhrase}
              alt="강아지가 먼저 찾는 간식"
              className="lg:max-w-[290px] h-auto max-lg:mb-2 lg:mb-4 max-lg:hidden"
            />
            {/* 모바일/태블릿 캐치프레이즈 */}
            <Image
              src={heroCatchPhraseMobile}
              alt="강아지가 먼저 찾는 간식"
              className="w-[212px] h-auto mb-3 lg:hidden"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={400}>
            <Text
              variant="subtitle-20-m"
              className="text-hero-subtext max-lg:text-body-14-m max-lg:text-center lg:text-left lg:text-[18px] lg:leading-[21px] lg:font-medium lg:whitespace-nowrap max-lg:mb-1 lg:mb-3"
            >
              먹는 순간 표정이 달라지는 휴먼그레이드 수제 간식 구독
            </Text>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={450}>
            <p className="text-[var(--color-hero-tagline)] max-lg:text-center max-lg:text-body-13-r lg:text-left lg:text-body-14-m lg:leading-[17px] lg:whitespace-nowrap max-lg:mb-6 lg:mb-[52px]">
              #재구매율 91%, #100% 국내산 수제, #알러지 맞춤 추천
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={550}>
            <Button
              onClick={handleChecklistCtaClick}
              variant="primary"
              size="lg"
              className="bg-primary max-lg:w-[230px] lg:w-[282px] max-lg:h-[40px] max-lg:px-5 max-lg:text-[13px] lg:text-[16px] leading-[30px] whitespace-nowrap"
            >
              10초 진단하고 우리 아이 맞춤 추천 받기
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
