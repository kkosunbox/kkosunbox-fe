"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { useReferral } from "@/features/referral/model";
import referralHeroBg from "../assets/main-hero-referal-bg.png";
import referralHeroBgMobile from "../assets/main-hero-referral-bg-mobile.png";
import referralHeroBgTablet from "../assets/main-hero-referral-bg-tablet.png";
import referralHeroCenterCard from "../assets/main-hero-referal-center-card.png";
import referralHeroCenterCard15Percent from "../assets/main-hero-referal-center-card-15-percent.png";
import referralHeroSubtitle from "../assets/main-hero-referal-subtitle.svg";
import referralHeroTitle from "../assets/main-hero-referral-title.svg";
import referralHeroTitlePc from "../assets/main-hero-referral-title-pc.svg";
import referralHeroNonPcLeftTopTwinkle from "../assets/main-hero-referral-non-pc-left-top-twinkle.png";
import referralHeroNonPcLeftBottomTwinkle from "../assets/main-hero-referral-non-pc-left-bottom-twinkle.png";
import referralHeroNonPcRightTopTwinkle from "../assets/main-hero-referral-non-pc-right-top-twinkle.png";
import referralHeroNonPcRightBottomTwinkle from "../assets/main-hero-referral-non-pc-right-bottom-twinkle.png";
import referralHeroLeftTwinkle from "../assets/main-hero-referal-left-twinkle.svg";
import referralHeroRightTwinkle from "../assets/main-hero-referal-right-twinkle.svg";

export default function ReferralHeroSection() {
  const router = useRouter();
  const { influencerName, discountRate, profileImageUrl } = useReferral();
  const discountPct = Math.round(discountRate * 100);
  const cardSrc =
    discountPct === 15
      ? referralHeroCenterCard15Percent.src
      : referralHeroCenterCard.src;
  const [profileError, setProfileError] = useState(false);
  const showProfile = !!profileImageUrl && !profileError;

  return (
    <section className="relative overflow-hidden max-lg:h-[585px] lg:h-[594px]">
      {/* 배경 이미지 — 모바일 (< 768px) */}
      <img
        src={referralHeroBgMobile.src}
        alt=""
        className="md:hidden absolute inset-0 w-full h-full object-cover object-top"
        loading="eager"
        decoding="async"
      />
      {/* 배경 이미지 — 태블릿 (768px – 1199px) */}
      <img
        src={referralHeroBgTablet.src}
        alt=""
        className="max-md:hidden lg:hidden absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
      {/* 배경 이미지 — 데스크탑 (≥ 1200px) */}
      <img
        src={referralHeroBg.src}
        alt=""
        className="max-lg:hidden absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        decoding="async"
      />

      <div className="relative z-10 h-full mx-auto max-w-[1440px] flex items-stretch px-4 lg:px-0">
        {/* 왼쪽: 인플루언서 원형 프로필
            1920px Figma 기준: left 325px, top 229px, size 240px
            lg viewport(1440px): background clips 240px each side → circle at x=85 from content left */}
        <div className="max-md:hidden flex-shrink-0 md:flex md:items-start md:justify-center md:pt-[292px] md:w-[220px] lg:block lg:pt-0 lg:w-[330px] lg:pl-[85px]">
          {showProfile && (
            <div className="md:w-[170px] md:h-[170px] lg:mt-[229px] lg:w-[240px] lg:h-[240px] rounded-full overflow-hidden ring-4 ring-white/60 shadow-lg">
              <img
                src={profileImageUrl}
                alt={`${influencerName} 프로필`}
                className="w-full h-full object-cover object-top"
                loading="eager"
                decoding="async"
                onError={() => setProfileError(true)}
              />
            </div>
          )}
        </div>

        {/* 중앙: 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col items-center max-md:pt-[58px] md:pt-[108px] lg:pt-[109px] pb-[48px]">
          {/* 모바일 전용 인플루언서 원형 사진 */}
          {showProfile && (
            <div className="md:hidden mb-5 w-[110px] h-[110px] rounded-full overflow-hidden ring-4 ring-white/60 shadow-md">
              <img
                src={profileImageUrl}
                alt={`${influencerName} 프로필`}
                className="w-full h-full object-cover object-top"
                loading="eager"
                decoding="async"
                onError={() => setProfileError(true)}
              />
            </div>
          )}

          {/* 서브타이틀: [인플루언서명] + "님과 함께하는 특별혜택" SVG */}
          <div className="flex items-baseline gap-2 flex-wrap justify-center max-md:mb-[8px] md:mb-[6px] lg:mb-3">
            <span
              className="font-bold tracking-[-0.04em] text-[var(--color-hero-heading)] max-md:text-[16px] md:text-[20px] lg:text-[28px]"
              style={{ fontFamily: '"GMarketSans"' }}
            >
              [{influencerName}]
            </span>
            <img
              src={referralHeroSubtitle.src}
              alt="님과 함께하는 특별혜택"
              width={200}
              height={19}
              className="max-md:w-[140px] md:w-[170px] lg:w-[200px] h-auto"
              decoding="async"
            />
          </div>

          {/* 꼬순박스 구독 제목 SVG — 모바일·태블릿 전용 */}
          <img
            src={referralHeroTitle.src}
            alt="꼬순박스 구독"
            width={245}
            height={48}
            className="max-lg:block lg:hidden w-[245px] h-auto max-md:mb-[12px] md:mb-[16px]"
            loading="eager"
            decoding="async"
          />

          {/* 꼬순박스 구독 제목 SVG — 데스크탑·와이드 전용 */}
          <img
            src={referralHeroTitlePc.src}
            alt="꼬순박스 구독"
            width={372}
            height={81}
            className="max-lg:hidden w-[372px] h-auto mb-6"
            loading="eager"
            decoding="async"
          />

          {/* 카드 + 반짝이 */}
          <div className="max-md:mb-4 md:mb-[55px] lg:mb-4">
            {/* 모바일·태블릿 전용: non-PC twinkles */}
            <div className="lg:hidden relative w-[331px] h-[174px]">
              <div
                className="absolute w-[240px]"
                style={{ left: 39, top: 0, animation: "referralFloat 2.8s ease-in-out -1.4s infinite" }}
              >
                <img
                  src={cardSrc}
                  alt=""
                  className="w-full h-auto drop-shadow-lg"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <img
                src={referralHeroNonPcLeftTopTwinkle.src}
                alt=""
                className="absolute"
                style={{ left: 0, top: 38, width: 14, height: 15, animation: "referralTwinklePulse 2s ease-in-out infinite" }}
                decoding="async"
              />
              <img
                src={referralHeroNonPcLeftBottomTwinkle.src}
                alt=""
                className="absolute"
                style={{ left: 5, top: 70, width: 26, height: 30, animation: "referralFloat 3.2s ease-in-out 0.8s infinite" }}
                decoding="async"
              />
              <img
                src={referralHeroNonPcRightTopTwinkle.src}
                alt=""
                className="absolute"
                style={{ left: 305, top: 79, width: 26, height: 30, animation: "referralFloat 3.9s ease-in-out 0.5s infinite" }}
                decoding="async"
              />
              <img
                src={referralHeroNonPcRightBottomTwinkle.src}
                alt=""
                className="absolute"
                style={{ left: 298, top: 109, width: 15, height: 14, animation: "referralTwinklePulse 2.4s ease-in-out 1.2s infinite" }}
                decoding="async"
              />
            </div>

            {/* 데스크탑·와이드 전용: PC twinkles */}
            <div className="max-lg:hidden flex items-center gap-[35px]">
              <img
                src={referralHeroLeftTwinkle.src}
                alt=""
                width={37}
                height={74}
                className="w-[37px] h-auto"
                style={{ animation: "referralFloat 2.4s ease-in-out infinite" }}
                decoding="async"
              />
              <div
                className="relative w-[280px]"
                style={{ animation: "referralFloat 2.8s ease-in-out -1.4s infinite" }}
              >
                <img
                  src={cardSrc}
                  alt=""
                  className="w-full h-auto drop-shadow-lg"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <img
                src={referralHeroRightTwinkle.src}
                alt=""
                width={35}
                height={41}
                className="w-[35px] h-auto"
                style={{ animation: "referralFloat 3s ease-in-out 0.6s infinite" }}
                decoding="async"
              />
            </div>
          </div>

          {/* 혜택 안내 문구 */}
          <p className="text-[var(--color-hero-heading)] font-semibold max-md:mb-3 md:mb-[26px] lg:mb-3 max-lg:text-[13px] lg:text-[14px]">
            이 페이지에서만 가능한 특별한 혜택!
          </p>

          {/* CTA 버튼 */}
          <Button
            onClick={() => router.push("/subscribe")}
            variant="primary"
            size="lg"
            style={{
              background: "var(--color-accent-orange)",
              borderRadius: 12,
            }}
            className="text-white font-semibold tracking-[-0.04em] whitespace-nowrap transition-opacity hover:opacity-90 max-md:w-[240px] md:w-[240px] lg:w-[282px] lg:text-[16px]"
          >
            꼬순박스 {discountPct}% 할인받기
          </Button>
        </div>

        {/* 오른쪽 여백 (배경 이미지 강아지 영역) */}
        <div className="max-md:hidden flex-shrink-0 md:w-[220px] lg:w-[330px]" />
      </div>
    </section>
  );
}
