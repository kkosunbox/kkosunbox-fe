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
    <section className="relative overflow-hidden h-[585px] md:h-[537px]">
      {/* 모바일 배경 이미지 */}
      <div className="md:hidden absolute inset-0 flex justify-center overflow-hidden">
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
        className="object-cover object-bottom max-md:hidden"
        priority
      />

      {/* 콘텐츠 오버레이 */}
      <div className="relative z-10 mx-auto max-w-content h-full flex max-md:items-start md:items-center max-md:justify-center max-md:pt-[43px] px-5 md:px-0">
        <div className="flex flex-col max-md:items-center md:items-start justify-center md:pl-20">
          <ScrollReveal variant="fade-up" delay={100}>
            <Image
              src={logoMain}
              alt="꼬순박스 로고"
              className="w-full max-md:max-w-[158px] md:max-w-[114px] max-md:max-h-[54px] md:max-h-[36px] mb-3 md:mb-5"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={250}>
            {/* 데스크톱 캐치프레이즈 */}
            <Image
              src={heroCatchPhrase}
              alt="강아지가 먼저 찾는 간식"
              className="md:max-w-[290px] h-auto mb-2 md:mb-4 max-md:hidden"
            />
            {/* 모바일 캐치프레이즈 */}
            <Image
              src={heroCatchPhraseMobile}
              alt="강아지가 먼저 찾는 간식"
              className="w-[212px] h-auto mb-3 md:hidden"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={400}>
            <Text
              variant="subtitle-20-m"
              mobileVariant="body-14-m"
              className="text-hero-subtext max-md:text-center md:text-left md:text-[18px] md:leading-[21px] md:font-medium md:whitespace-nowrap mb-1 md:mb-3"
            >
              먹는 순간 표정이 달라지는 휴먼그레이드 수제 간식 구독
            </Text>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={450}>
            <p className="text-[var(--color-hero-tagline)] max-md:text-center max-md:text-body-13-r md:text-left md:text-body-14-m md:leading-[17px] md:whitespace-nowrap mb-6 md:mb-[52px]">
              #재구매율 91%, #100% 국내산 수제, #알러지 맞춤 추천
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={550}>
            <Button
              onClick={handleChecklistCtaClick}
              variant="primary"
              size="lg"
              className="bg-primary max-md:w-[230px] md:w-[282px] max-md:h-[40px] max-md:px-5 max-md:text-[13px] max-md:leading-[30px] md:text-[16px] md:leading-[30px] whitespace-nowrap"
            >
              10초 진단하고 우리 아이 맞춤 추천 받기
            </Button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
