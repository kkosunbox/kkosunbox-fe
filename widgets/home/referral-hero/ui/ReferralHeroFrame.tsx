"use client";

import type { ReactNode } from "react";
import { useHeroChecklistCta } from "@/widgets/home/hero";
import styles from "./ReferralHero.module.css";

interface ReferralHeroFrameProps {
  discountPct: number;
  /** 섹션 전체에 깔리는 배경 (없으면 `--gradient-referral-hero`) */
  background?: ReactNode;
  /** 텍스트 오른쪽(모바일·태블릿은 아래)에 흐름대로 놓이는 비주얼 */
  visual?: ReactNode;
  /** 컨테이너 밖 섹션 기준 장면 — 데스크탑은 absolute 배경, 모바일·태블릿은 텍스트 아래 흐름 */
  scene?: ReactNode;
  /** 왼쪽 문구(배지 → 제목 → 설명 → 버튼)를 첫 진입 때 순차 등장시킨다 */
  animateIntro?: boolean;
}

/**
 * 초대 랜딩(`/r/{slug}`) Hero 공통 틀.
 * Figma 1920 기준: 상단 배너 아래 높이 713px, 텍스트는 1240 컨테이너 좌측에 정렬된다.
 */
export default function ReferralHeroFrame({ discountPct, background, visual, scene, animateIntro = false }: ReferralHeroFrameProps) {
  const handleCta = useHeroChecklistCta();
  const introItem = animateIntro ? styles.introItem : "";

  return (
    <section
      aria-labelledby="referral-hero-title"
      className="relative overflow-hidden lg:h-[713px]"
      style={{ background: "var(--gradient-referral-hero)" }}
    >
      {background}

      <svg
        viewBox="0 0 786 473"
        fill="none"
        aria-hidden="true"
        className="absolute text-referral-hero-blob max-md:-left-[63px] max-md:-top-[77px] max-md:w-[430px] md:max-lg:-left-[88px] md:max-lg:-top-[107px] md:max-lg:w-[600px] lg:-left-[115px] lg:-top-[140px] lg:w-[786px]"
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

      <div className="relative z-10 mx-auto flex pt-[var(--header-height)] max-lg:flex-col max-md:px-5 md:max-lg:px-8 lg:h-full lg:w-[calc(100%_-_80px)] lg:max-w-[1240px] lg:items-end lg:justify-between">
        <div className="max-md:pt-10 md:max-lg:pt-14 lg:mb-[124px]">
          <span className={`${introItem} inline-flex h-[29px] items-center rounded-full bg-referral-hero-badge px-[15px] text-[14px] font-medium tracking-[-0.04em] text-white`}>
            정기구독 첫 달 할인 적용
          </span>
          <h1
            id="referral-hero-title"
            className={`${introItem} mt-[14px] font-extrabold tracking-[-0.04em] text-[var(--color-text)] max-md:text-[30px] max-md:leading-[38px] md:max-lg:text-[40px] md:max-lg:leading-[50px] lg:text-[48px] lg:leading-[58px]`}
          >
            <span className="text-[var(--color-cta-button)]">꼬순박스 PICK</span>
            <br />
            첫 구독 {discountPct}% 이벤트
          </h1>
          <p className={`${introItem} font-medium tracking-[-0.02em] text-[var(--color-text)] max-md:mt-4 max-md:text-[15px] md:mt-6 md:text-[18px]`}>
            지금 회원가입을 하고 첫 구독 할인을 받아보세요.
          </p>
          <button
            type="button"
            onClick={handleCta}
            className={`${introItem} rounded-[12px] bg-[var(--color-cta-button)] font-[600] tracking-[-0.04em] text-white transition-opacity hover:opacity-90 max-md:mt-6 max-md:h-12 max-md:px-6 max-md:text-[14px] md:mt-8 md:h-[52px] md:w-[282px] md:text-[16px]`}
          >
            우리 아이한테 딱 맞는 간식 알아보기
          </button>
        </div>

        {visual}
      </div>

      {scene}
    </section>
  );
}
