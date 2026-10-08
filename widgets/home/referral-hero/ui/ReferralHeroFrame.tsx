"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useHeroChecklistCta } from "@/widgets/home/hero";
import heroBg from "../assets/referral-hero-bg.webp";
import styles from "./ReferralHero.module.css";

interface ReferralHeroFrameProps {
  discountPct: number;
  /** 텍스트 오른쪽(모바일·태블릿은 아래)에 흐름대로 놓이는 비주얼 */
  visual: ReactNode;
  /** 왼쪽 문구(배지 → 제목 → 설명 → 버튼)를 첫 진입 때 순차 등장시킨다 */
  animateIntro?: boolean;
}

/**
 * 초대 랜딩(`/r/{slug}`) Hero 공통 틀.
 * Figma 1920 기준: 상단 배너 아래 높이 713px, 텍스트는 1240 컨테이너 좌측에 정렬된다.
 */
export default function ReferralHeroFrame({
  discountPct,
  visual,
  animateIntro = false,
}: ReferralHeroFrameProps) {
  const handleCta = useHeroChecklistCta();
  const introItem = animateIntro ? styles.introItem : "";

  return (
    <section
      aria-labelledby="referral-hero-title"
      className="relative overflow-hidden lg:h-[713px]"
      style={{ background: "var(--gradient-referral-hero)" }}
    >
      {/* Figma 배경(1920×743)은 상단 배너 영역까지 포함한 크기라 아래에 맞춰 위쪽을 잘라낸다.
          이미지가 뜨기 전·실패 시에는 섹션의 `--gradient-referral-hero`가 보인다. */}
      <Image
        src={heroBg}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom"
      />

      <svg
        viewBox="0 0 786 473"
        fill="none"
        aria-hidden="true"
        className="absolute text-referral-hero-blob max-md:-left-[162px] max-md:-top-[52px] max-md:w-[477px] md:max-lg:-left-[88px] md:max-lg:-top-[107px] md:max-lg:w-[600px] lg:-left-[115px] lg:-top-[140px] lg:w-[786px]"
      >
        <path
          d="M332.209 439.252L83.5182 330.131C44.2938 312.897 11.1351 274.459 3.85636 243.962C-21.2958 139.289 80.0406 57.9649 207.257 40.4929L489.591 1.6574C606.537 -14.3851 781.146 88.3027 785.837 211.322C789.314 302.414 736.988 383.262 658.863 427.418C557.365 484.917 441.147 487.062 332.128 439.252H332.209Z"
          fill="currentColor"
        />
      </svg>

      {/* 투명 헤더 메뉴 가독성용 상단 그늘 (Figma 헤더 영역 그라디언트) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[var(--header-height)]"
        style={{ background: "var(--gradient-referral-hero-header-shade)" }}
        aria-hidden="true"
      />

      {/* 768px 이상은 문구 왼쪽·비주얼 오른쪽 구도를 유지하고 비주얼만 축소, 768px 미만은 비주얼을 문구 위로 쌓는다.
          (DOM 순서는 문구가 먼저 — 제목·버튼이 스크린리더·검색엔진에 먼저 읽히도록 flex-col-reverse로 순서만 뒤집는다.) */}
      <div className="relative z-10 mx-auto flex max-md:flex-col-reverse max-md:px-9 max-md:pt-[var(--header-height)] md:max-lg:items-center md:max-lg:gap-6 md:max-lg:px-8 md:max-lg:pb-14 md:max-lg:pt-[calc(var(--header-height)_+_56px)] lg:h-full lg:w-[calc(100%_-_80px)] lg:max-w-[1240px] lg:items-end lg:justify-between lg:pt-[var(--header-height)]">
        <div className="shrink-0 max-md:pb-12 md:max-lg:w-[330px] lg:mb-[124px]">
          <span
            className={`${introItem} flex w-fit items-center rounded-full bg-referral-hero-badge font-medium tracking-[-0.04em] text-white max-md:h-[25px] max-md:px-[9px] max-md:text-[11px] md:h-[29px] md:px-[15px] md:text-[14px]`}
          >
            정기구독 첫 달 할인 적용
          </span>
          <h1
            id="referral-hero-title"
            className={`${introItem} break-keep font-extrabold tracking-[-0.04em] text-[var(--color-text)] max-md:mt-3 max-md:text-[28px] max-md:leading-[33px] md:mt-[14px] md:max-lg:text-[34px] md:max-lg:leading-[44px] lg:text-[48px] lg:leading-[58px]`}
          >
            <span className="text-[var(--color-cta-button)]">
              꼬순박스 PICK
            </span>
            <br />첫 구독 {discountPct}% 할인 이벤트
          </h1>
          <p
            className={`${introItem} font-medium tracking-[-0.02em] text-[var(--color-text)] max-md:mt-2.5 max-md:text-[14px] max-md:leading-[20px] md:max-lg:mt-5 md:max-lg:text-[16px] lg:mt-6 lg:text-[18px] lg:leading-[21px]`}
          >
            지금 회원가입을 하고 첫 구독 할인을 받아보세요.
          </p>
          <button
            type="button"
            onClick={handleCta}
            className={`${introItem} bg-[var(--color-cta-button)] font-[600] tracking-[-0.04em] text-white transition-opacity hover:opacity-90 max-md:mt-6 max-md:h-10 max-md:min-w-[230px] max-md:rounded-[10px] max-md:px-5 max-md:text-[13px] md:mt-8 md:rounded-[12px] md:h-[52px] md:w-[282px] md:text-[16px]`}
          >
            우리 아이한테 딱 맞는 간식 알아보기
          </button>
        </div>

        {visual}
      </div>
    </section>
  );
}
