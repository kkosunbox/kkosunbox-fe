"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useReferral } from "@/features/referral/model";
import { Button } from "@/shared/ui";
import referralOfferHeroBg from "../assets/referral-offer-hero-bg.png";
import referralOfferCard from "../assets/referral-offer-card.png";
import referralOfferHeroTitle from "../assets/referral-offer-hero-title.png";

/** 인플루언서 프로필 페이지를 숨긴 활성 slug에 노출하는 공용 첫 달 할인 Hero. */
export default function ReferralOfferHeroSection() {
  const router = useRouter();
  const { discountRate } = useReferral();
  const discountPct = Math.round(discountRate * 100);

  return (
    <section className="relative overflow-hidden max-lg:h-[585px] lg:h-[674px]">
      <Image
        src={referralOfferHeroBg}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0">
        <div className="absolute left-1/2 -translate-x-1/2 max-md:top-[70px] md:max-lg:top-[70px] lg:top-[117px]">
          <span className="flex h-[29px] items-center justify-center rounded-full bg-[var(--color-referral-offer-badge)] px-[15px] text-[14px] font-medium leading-[17px] tracking-[-0.04em] text-white whitespace-nowrap">
            정기구독 첫 달 할인 적용
          </span>
        </div>

        <Image
          src={referralOfferHeroTitle}
          alt="꼬순박스 첫 달 할인"
          priority
          className="absolute left-1/2 h-auto -translate-x-1/2 max-md:top-[116px] max-md:w-[305px] md:max-lg:top-[120px] md:max-lg:w-[410px] lg:top-[161px] lg:w-[509px]"
        />

        <div className="absolute left-1/2 -translate-x-1/2 max-md:top-[215px] md:max-lg:top-[210px] lg:top-[270px]">
          <div
            className="relative max-md:w-[248px] md:max-lg:w-[275px] lg:w-[289px]"
            style={{ animation: "referralFloat 2.8s ease-in-out -1.4s infinite" }}
          >
            <Image src={referralOfferCard} alt="" priority className="h-auto w-full" />
            <div className="absolute left-[15%] top-[20%] rotate-[6.84deg]">
              <p className="text-[16px] font-bold leading-[19px] tracking-[-0.04em] text-[var(--color-cta-button)] max-md:text-[14px] max-md:leading-[17px]">
                첫 구독 특별 할인혜택
              </p>
              <strong className="block text-[54px] font-bold leading-[64px] tracking-[-0.04em] text-[var(--color-why-choose-text)] max-md:text-[46px] max-md:leading-[54px]">
                {discountPct}%
              </strong>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center max-md:top-[445px] md:max-lg:top-[398px] lg:top-[453px]">
          <p className="mb-[16px] text-[14px] font-semibold leading-[17px] tracking-[-0.04em] text-[var(--color-hero-heading)] max-md:text-[13px]">
            이 페이지에서만 가능한 특별한 혜택!
          </p>
          <Button
            onClick={() => router.push("/subscribe")}
            variant="primary"
            size="lg"
            style={{
              background: "var(--color-cta-button)",
              borderRadius: 12,
            }}
            className="text-[16px] font-semibold leading-[30px] tracking-[-0.04em] text-white transition-opacity hover:opacity-90 max-md:w-[240px] md:max-lg:w-[282px] lg:w-[282px]"
          >
            꼬순박스 {discountPct}% 할인받기
          </Button>
        </div>
      </div>
    </section>
  );
}
