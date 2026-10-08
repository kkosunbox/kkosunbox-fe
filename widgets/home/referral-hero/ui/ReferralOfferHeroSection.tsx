"use client";

import Image from "next/image";
import { useReferral } from "@/features/referral/model";
import offerHeroBg from "../assets/referral-offer-hero-bg.webp";
import ReferralHeroFrame from "./ReferralHeroFrame";

/** 쿠폰 문구 공통: 장면 이미지 위 좌표(%)에 중심을 맞추고 이미지와 같은 각도로 기울인다. */
const COUPON_TEXT = "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bold";

/**
 * 인플루언서 프로필 페이지를 숨긴 활성 slug의 Hero — 선물상자·쿠폰 장면.
 *
 * 장면 이미지는 Figma 1920×744 프레임 전체(배경 포함)이고, 할인율만 실시간 텍스트로 올린다.
 * 텍스트 좌표·크기는 장면 너비 기준(%, cqw)이라 장면이 어떤 크기로 그려져도 쿠폰 위에 고정된다.
 * - 데스크탑: 1920px(이상) 폭으로 섹션 하단에 붙여 좌우만 잘리게 깐다 — Figma 배치 그대로.
 * - 모바일·태블릿: 텍스트 아래에 두고 쿠폰 장면이 가운데 오도록 당긴다. 위·오른쪽 가장자리는 배경으로 페이드.
 */
export default function ReferralOfferHeroSection() {
  const { discountRate } = useReferral();
  const discountPct = Math.round(discountRate * 100);

  const scene = (
    <div
      aria-hidden="true"
      className="aspect-[1920/744] [container-type:inline-size] max-lg:relative max-lg:left-1/2 max-lg:-translate-x-[64.4%] max-lg:[mask-composite:intersect] max-lg:[mask-image:linear-gradient(to_bottom,transparent_0%,black_24%),linear-gradient(to_right,black_85%,transparent_100%)] max-sm:w-[800px] max-md:-mt-[60px] sm:max-md:w-[880px] md:max-lg:-mt-[96px] md:max-lg:w-[1300px] lg:absolute lg:bottom-0 lg:left-1/2 lg:w-[max(100%,1920px)] lg:-translate-x-1/2"
    >
      <Image
        src={offerHeroBg}
        alt=""
        fill
        priority
        sizes="(min-width: 1200px) 1920px, (min-width: 768px) 1300px, 880px"
        className="object-cover"
      />
      <p
        className={`${COUPON_TEXT} left-[64.24%] top-[48.75%] rotate-[10deg] text-[1.25cqw] leading-[1.5cqw] tracking-[-0.04em] text-referral-coupon-title`}
        style={{ textShadow: "0 1.3px 0 rgba(255, 255, 255, 0.55)" }}
      >
        첫 구독 특별 할인혜택
      </p>
      <strong
        className={`${COUPON_TEXT} left-[63.75%] top-[58.39%] rotate-[10deg] font-[family-name:var(--font-gantari)] text-[5.21cqw] leading-[3.33cqw] tracking-[-0.04em] text-[var(--color-why-choose-text)]`}
      >
        {discountPct}%
      </strong>
      <span
        className={`${COUPON_TEXT} left-[75.22%] top-[62.38%] -rotate-[80deg] text-[1.67cqw] tracking-[0.08em] text-white`}
      >
        COUPON
      </span>
    </div>
  );

  return <ReferralHeroFrame discountPct={discountPct} scene={scene} />;
}
