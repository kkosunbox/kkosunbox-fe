"use client";

/* eslint-disable @next/next/no-img-element -- 인플루언서 프로필은 API가 제공하는 동적 URL이다. */

import { useState } from "react";
import Image from "next/image";
import { useReferral } from "@/features/referral/model";
import cloverIcon from "../assets/referral-hero-clover.svg";
import ribbonIcon from "../assets/referral-hero-ribbon.svg";
import dotIcon from "../assets/referral-hero-dot.svg";
import couponStem from "../assets/referral-hero-coupon-stem.svg";
import profileFallback from "../assets/referral-hero-profile-fallback.webp";
import ReferralHeroFrame from "./ReferralHeroFrame";
import styles from "./ReferralHero.module.css";

/**
 * 마지막 글자를 읽었을 때의 받침 유무로 주격 조사(이/가)를 고른다.
 * - 한글: 받침 유무 그대로
 * - 영문 대문자: 알파벳 이름으로 읽는다(TV → 티비 → 가). 엘·엠·엔·알만 받침이 있다.
 * - 영문 소문자: 단어로 읽는다(kim → 킴 → 이). 모음으로 끝나면 받침 없음.
 * - 숫자: 읽는 소리(0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔은 받침 있음)
 */
function subjectParticle(name: string): "이" | "가" {
  const last = name.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 === 0 ? "가" : "이";
  if (/[A-Z]/.test(last)) return /[LMNR]/.test(last) ? "이" : "가";
  if (/[a-z]/.test(last)) return /[aeiouy]/.test(last) ? "가" : "이";
  if (/[0-9]/.test(last)) return /[013678]/.test(last) ? "이" : "가";
  return "이";
}

/**
 * Figma 쿠폰(340×216 바운딩, 카드 321×154를 7° 회전).
 * 내부 좌표는 회전 전 카드 기준이며, Figma 3x 원본을 카드 축으로 투영해 측정한 값이다.
 */
function ReferralCoupon({ discountPct, className }: { discountPct: number; className: string }) {
  return (
    <div aria-hidden="true" className={`absolute h-[216px] w-[340px] ${className}`}>
      <div className={`absolute left-[8.2px] top-[42.9px] h-[154px] w-[321px] ${styles.couponFloat}`}>
        <div className="absolute inset-0 rotate-[7deg]">
          {/* 그림자는 별도 레이어 — 쿠폰이 떠오를 때 opacity만으로 옅어지게 한다. */}
          <div className={`absolute inset-0 rounded-[12px] shadow-[0_6px_8px_var(--color-referral-coupon-shadow)] ${styles.couponShadow}`} />
          {/* 면은 가운데 흰색 → 가장자리 크림색. 불투명하게 칠해 뒤 썸네일이 비치지 않게 한다. */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[12px]"
            style={{ background: "var(--gradient-referral-coupon-face)" }}
          >
            <div className="absolute inset-y-0 right-0 w-[75px] bg-[var(--color-cta-button)]" />
          </div>
          {/* 2px 그라데이션 테두리 — 마스크로 테두리 영역만 남겨 면·탭 위에 얹는다. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[12px] p-[2px]"
            style={{
              background: "var(--gradient-referral-coupon-stroke)",
              mask: "linear-gradient(black, black) content-box exclude, linear-gradient(black, black)",
              WebkitMask: "linear-gradient(black, black) content-box xor, linear-gradient(black, black)",
            }}
          />
          {/* 리본띠 SVG는 자체로 7.04° 기울어 있어, 카드 안에서는 그만큼 되돌려 카드 기준 수직으로 세운다.
              회전 기준점은 띠 아래 끝 중심(1.69, 176.7) — Figma처럼 카드 왼쪽 29.75px, 카드 하단(153.4)에서 끝나게 맞춘다.
              되돌려 세우면 세로 길이가 177.8px로 늘어 Figma(176.8px)보다 위로 1px 솟으므로 세로를 0.994배로 맞춘다. */}
          <Image
            src={couponStem}
            alt=""
            width={41}
            height={177}
            className="absolute left-[28.06px] top-[-23.3px] origin-[1.69px_176.7px] -rotate-[7.04deg] scale-y-[0.994]"
          />
          {/* 모바일은 쿠폰 전체가 0.426배로 줄어 글자가 너무 작아지므로, Figma 모바일 시안 비율로 문구만 따로 키운다
              (특별 할인혜택 약 1.2배 — 탭과 여백 유지, COUPON 약 1.4배, 15%는 0.9배). */}
          <p
            className="absolute whitespace-nowrap font-bold tracking-[-0.04em] text-referral-coupon-title max-md:left-[72px] max-md:top-[27.5px] max-md:text-[19px] max-md:leading-[23px] md:left-[72px] md:top-[29.6px] md:text-[16px] md:leading-[19px]"
            style={{ textShadow: "0 1.3px 0 rgba(255, 255, 255, 0.55)" }}
          >
            첫 구독 특별 할인혜택
          </p>
          <strong className="absolute left-[139px] top-[94px] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-[family-name:var(--font-gantari)] font-bold tracking-[-0.04em] text-[var(--color-why-choose-text)] max-md:text-[68px] max-md:leading-[58px] md:text-[76px] md:leading-[64px]">
            {discountPct}%
          </strong>
          <span className="absolute left-[283.5px] top-[77px] -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap font-bold tracking-[0.08em] text-white max-md:text-[23px] md:text-[16px]">
            COUPON
          </span>
        </div>
      </div>
    </div>
  );
}

/** 인플루언서 프로필 페이지가 공개된 slug의 Hero — 인플루언서 사진 카드 + 첫 구독 쿠폰. */
export default function ReferralHeroSection() {
  const { influencerName, discountRate, profileImageUrl } = useReferral();
  const discountPct = Math.round(discountRate * 100);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showPhoto = !!profileImageUrl && failedImageUrl !== profileImageUrl;

  // 비주얼 박스를 감싸는 영역 너비에 맞춰 통째로 비율 축소한다. 캡션 글자만 최소 크기를 보장한다.
  // - 768px 이상: 데스크탑 구도(622×549). 태블릿은 문구 옆 남은 폭에 맞춰 축소.
  // - 768px 미만: Figma 모바일 구도(375 기준 302×286) — 카드 189px, 쿠폰 0.426배, 문구 위에 놓는다.
  const visual = (
    <div className="relative min-w-0 [container-type:inline-size] max-md:-mt-[11px] max-md:mb-[14px] max-md:aspect-[302/286] max-md:w-full max-md:max-w-[420px] max-md:self-center md:aspect-[622/549] md:max-lg:ml-auto md:max-lg:max-w-[622px] md:max-lg:flex-1 lg:mb-[68px] lg:w-[622px] lg:shrink-0">
      <div className={`absolute left-0 top-0 max-md:h-[286px] max-md:w-[302px] md:h-[549px] md:w-[622px] ${styles.visualStage}`}>
        <figure className="absolute right-0 top-0 flex flex-col overflow-hidden shadow-[0_12px_12px_rgba(0,0,0,0.25)] max-md:w-[189px] max-md:rounded-[20px_20px_0_20px] md:w-[374px] md:rounded-[48px_48px_0_48px]">
          <div className="relative flex items-center justify-center bg-referral-hero-photo-bg max-md:h-[212px] md:h-[445px]">
            {showPhoto ? (
              <img
                src={profileImageUrl}
                alt={`${influencerName} 프로필`}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="eager"
                decoding="async"
                onError={() => setFailedImageUrl(profileImageUrl)}
              />
            ) : (
              // 프로필 사진이 없거나 불러오지 못하면 기본 일러스트 — 인물 하단이 잘린 그림이라 아래에 붙인다.
              <Image
                src={profileFallback}
                alt=""
                fill
                sizes="(min-width: 768px) 374px, 189px"
                loading="eager"
                className="object-contain object-bottom"
              />
            )}
          </div>
          {/* 캡션은 기본 104px(모바일 74px), 화면이 아주 좁아 최소 글자 크기가 적용되면 내용만큼 늘어난다. */}
          <figcaption className="flex flex-col items-center bg-referral-hero-caption-bg text-center max-md:min-h-[74px] max-md:px-3 max-md:pb-[8px] max-md:pt-[5px] md:min-h-[104px] md:px-6 md:pb-[20px] md:pt-[14px]">
            <strong className={`block max-w-full truncate font-[600] tracking-[-0.04em] text-[var(--color-cta-button)] ${styles.captionHandle}`}>
              @{influencerName}
            </strong>
            <span className={`block break-keep font-[600] max-md:mt-[7px] md:mt-2 tracking-[-0.04em] text-[var(--color-text)] ${styles.captionBody}`}>
              반려생활을 함께하는
              {/* 모바일 시안은 "반려생활을 함께하는 / {이름}이 / 꼬순박스를 추천해요." 세 줄 */}
              <span className="max-md:hidden"> </span>
              <br className="md:hidden" />
              <span className="whitespace-nowrap">
                {influencerName}
                {subjectParticle(influencerName)}
              </span>
              <br />
              꼬순박스를 추천해요.
            </span>
          </figcaption>
        </figure>

        <ReferralCoupon
          discountPct={discountPct}
          className="left-0 max-md:top-[141px] max-md:origin-top-left max-md:scale-[0.426] md:top-[247px]"
        />

        <Image src={dotIcon} alt="" width={16} height={14} className={`absolute max-md:left-[79px] max-md:top-[73.5px] max-md:w-[7px] md:left-[183px] md:top-[96px] md:w-[16px] ${styles.dotTwinkle}`} />
        <Image src={cloverIcon} alt="" width={34} height={34} className={`absolute max-md:left-[43px] max-md:top-[94.5px] max-md:w-[14.5px] md:left-[101px] md:top-[142px] md:w-[34px] ${styles.cloverWiggle}`} />
        <Image src={ribbonIcon} alt="" width={94} height={78} className={`absolute max-md:left-[80px] max-md:top-[101px] max-md:w-[41.5px] md:left-[171px] md:top-[159px] md:w-[94px] ${styles.ribbonSway}`} />
      </div>
    </div>
  );

  return <ReferralHeroFrame discountPct={discountPct} visual={visual} animateIntro />;
}
