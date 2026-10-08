"use client";

import Image from "next/image";
import { useReferral } from "@/features/referral/model";
import offerIllustration from "../assets/referral-offer-hero-illustration.webp";
import ReferralHeroFrame from "./ReferralHeroFrame";

/** 쿠폰 문구 공통: 일러스트 위 좌표(%)에 중심을 맞추고 쿠폰과 같은 각도(10°)로 기울인다. */
const COUPON_TEXT = "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bold";

/**
 * 인플루언서 프로필 페이지를 숨긴 활성 slug의 Hero — 선물상자·쿠폰 일러스트.
 *
 * 일러스트(Figma 693×441)는 빈 쿠폰 그림이고, 할인율만 실시간 텍스트로 올린다.
 * 텍스트 좌표·크기는 일러스트 너비 기준(%, cqw)이라 일러스트가 어떤 크기로 그려져도 쿠폰 위에 고정된다.
 */
export default function ReferralOfferHeroSection() {
  const { discountRate } = useReferral();
  const discountPct = Math.round(discountRate * 100);

  // Figma 1920 기준 일러스트는 x 897(컨테이너 오른쪽보다 10px 바깥까지), 아래 여백은 텍스트와 같은 124px.
  // 태블릿은 문구 옆 남은 폭에 맞춰 축소, 모바일은 문구 아래 화면 폭으로 놓는다.
  const visual = (
    <div
      aria-hidden="true"
      className="relative aspect-[693/441] min-w-0 [container-type:inline-size] max-md:mb-10 max-md:mt-6 max-md:w-full md:max-lg:ml-auto md:max-lg:max-w-[693px] md:max-lg:flex-1 lg:-mr-[10px] lg:mb-[124px] lg:w-[693px] lg:shrink-0"
    >
      <Image
        src={offerIllustration}
        alt=""
        fill
        priority
        sizes="(min-width: 1200px) 693px, (min-width: 768px) 55vw, calc(100vw - 40px)"
        className="object-contain"
      />
      <p
        className={`${COUPON_TEXT} left-[48.98%] top-[41.02%] rotate-[10deg] text-[2.89cqw] leading-[1.2] tracking-[-0.04em] text-referral-coupon-title`}
        style={{ textShadow: "0 1.3px 0 rgba(255, 255, 255, 0.55)" }}
      >
        첫 구독 특별 할인혜택
      </p>
      <strong
        className={`${COUPON_TEXT} left-[47.47%] top-[55.47%] rotate-[10deg] font-[family-name:var(--font-gantari)] text-[11.54cqw] leading-[9.24cqw] tracking-[-0.04em] text-[var(--color-why-choose-text)]`}
      >
        {discountPct}%
      </strong>
      <span
        className={`${COUPON_TEXT} left-[76.22%] top-[61.29%] -rotate-[80deg] text-[4.04cqw] leading-[1.2] tracking-[0.08em] text-white`}
      >
        COUPON
      </span>
    </div>
  );

  return <ReferralHeroFrame discountPct={discountPct} visual={visual} />;
}
