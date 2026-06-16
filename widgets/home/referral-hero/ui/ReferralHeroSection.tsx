"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { useReferral } from "@/features/referral/model";

export default function ReferralHeroSection() {
  const router = useRouter();
  const { influencerName, discountRate, profileImageUrl } = useReferral();
  const discountPct = Math.round(discountRate * 100);
  const [profileError, setProfileError] = useState(false);
  const showProfile = !!profileImageUrl && !profileError;

  return (
    <section className="relative overflow-hidden max-lg:h-[640px] lg:h-[594px]">
      {/* 배경 이미지 — 꼬순박스 구독 로고, 강아지, 장식 요소 포함 */}
      <img
        src="/images/referral/main-hero-referal-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        decoding="async"
      />

      <div className="relative z-10 h-full mx-auto max-w-[1440px] flex items-stretch px-4 lg:px-0">
        {/* 왼쪽: 인플루언서 원형 프로필
            1920px Figma 기준: left 325px, top 229px, size 240px
            lg viewport(1440px): background clips 240px each side → circle at x=85 from content left */}
        <div className="max-md:hidden flex-shrink-0 md:flex md:items-center md:justify-center md:w-[220px] lg:block lg:w-[330px] lg:pl-[85px]">
          {showProfile && (
            <div className="md:w-[160px] md:h-[160px] lg:mt-[229px] lg:w-[240px] lg:h-[240px] rounded-full overflow-hidden ring-4 ring-white/60 shadow-lg">
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
        <div className="flex-1 flex flex-col items-center max-md:pt-[52px] md:pt-[80px] lg:pt-[109px] pb-[48px]">
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
          <div className="flex items-baseline gap-2 flex-wrap justify-center max-md:mb-[60px] md:mb-[72px] lg:mb-[108px]">
            <span
              className="font-bold tracking-[-0.04em] text-[var(--color-hero-heading)] max-md:text-[16px] md:text-[22px] lg:text-[28px]"
              style={{ fontFamily: '"GMarketSans"' }}
            >
              [{influencerName}]
            </span>
            <img
              src="/images/referral/main-hero-referal-subtitle.svg"
              alt="님과 함께하는 특별혜택"
              width={200}
              height={19}
              className="max-md:w-[140px] md:w-[170px] lg:w-[200px] h-auto"
              decoding="async"
            />
          </div>

          {/* 카드 + 반짝이 */}
          <div className="flex items-center gap-[28px] lg:gap-[35px] mb-4">
            <img
              src="/images/referral/main-hero-referal-left-twinkle.svg"
              alt=""
              width={37}
              height={74}
              className="max-md:w-[24px] md:w-[28px] lg:w-[37px] h-auto"
              style={{ animation: "referralFloat 2.4s ease-in-out infinite" }}
              decoding="async"
            />
            {/* 동적 할인 카드 — PNG 배경 + 텍스트 오버레이 */}
            <div
              className="relative max-md:w-[220px] md:w-[240px] lg:w-[280px]"
              style={{ animation: "referralFloat 2.8s ease-in-out -1.4s infinite" }}
            >
              <img
                src="/images/referral/main-hero-referal-center-card.png"
                alt=""
                className="w-full h-auto drop-shadow-lg"
                loading="eager"
                decoding="async"
              />
            </div>
            <img
              src="/images/referral/main-hero-referal-right-twinkle.svg"
              alt=""
              width={35}
              height={41}
              className="max-md:w-[22px] md:w-[26px] lg:w-[35px] h-auto"
              style={{ animation: "referralFloat 3s ease-in-out 0.6s infinite" }}
              decoding="async"
            />
          </div>

          {/* 혜택 안내 문구 */}
          <p className="text-[var(--color-hero-heading)] font-semibold mb-3 max-md:text-[13px] md:text-[14px]">
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
            className="text-white font-semibold tracking-[-0.04em] whitespace-nowrap transition-opacity hover:opacity-90 max-lg:h-[44px] max-lg:w-[240px] max-lg:text-[14px] lg:h-[52px] lg:w-[282px] lg:text-[16px]"
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
