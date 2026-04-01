"use client";

import Image from "next/image";
import Link from "next/link";
import { Text } from "@/shared/ui";
import logoMain from "@/shared/assets/logo-main.svg";

/* ── 아이콘 ──────────────────────────────────────────────── */
function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 8C8 10 5.9 16.17 3.82 19.99c.02.01.04.01.06.01C8.09 20 17 18 17 8z"
        fill="var(--color-basic)"
      />
      <path
        d="M17 8s0 12-14 12"
        stroke="var(--color-basic)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="var(--color-premium)"
      />
    </svg>
  );
}

function DogIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" fill="var(--color-accent-orange)" />
      <path
        d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7"
        stroke="var(--color-accent-orange)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="6" r="1.5" fill="var(--color-accent-orange)" opacity="0.5" />
      <circle cx="17" cy="6" r="1.5" fill="var(--color-accent-orange)" opacity="0.5" />
    </svg>
  );
}

/* ── 피처 카드 ───────────────────────────────────────────── */
type FeatureCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
};

function FeatureCard({ icon, iconBg, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[var(--color-surface-warm)] rounded-2xl px-6 py-8 flex flex-col items-start">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <Text as="h3" variant="subtitle-18-b" mobileVariant="subtitle-16-sb" className="text-[var(--color-brown-dark)] mb-2">
        {title}
      </Text>
      <Text variant="body-14-r" mobileVariant="body-13-r" className="text-[var(--color-text-body-warm)]">
        {description}
      </Text>
    </div>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────────── */
export default function AboutSection() {
  return (
    <>
      {/* ━━━━ Section 1: 꼬순박스 소개 ━━━━ */}
      <section className="bg-[var(--color-background)] py-14 md:py-20">
        <div className="mx-auto max-w-[var(--max-width-content)] px-6 md:px-8 flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Left — 텍스트 */}
          <div className="flex-1 w-full">
            <Text
              as="h1"
              variant="title-32-b"
              mobileVariant="title-24-b"
              className="text-[var(--color-brown-dark)] mb-5"
            >
              꼬순박스 소개
            </Text>
            <Text
              variant="body-16-r"
              mobileVariant="body-14-r"
              className="text-[var(--color-text-body-warm)] mb-5"
            >
              우리는 반려견에게 건강을 고를 때 늘 고민했습니다.
            </Text>
            <div className="mb-5 flex flex-col gap-1">
              <p
                className="italic text-[var(--color-primary)] text-body-16-m"
                style={{ fontFamily: "var(--font-give-you-glory, inherit)" }}
              >
                &ldquo;~ 건강한 것은 건강해!&rdquo;
              </p>
              <p
                className="italic text-[var(--color-primary)] text-body-16-m"
                style={{ fontFamily: "var(--font-give-you-glory, inherit)" }}
              >
                &ldquo;다는 materials 없는 건강해!&rdquo;
              </p>
            </div>
            <Text
              variant="body-14-r"
              mobileVariant="body-13-r"
              className="text-[var(--color-text-body-warm)] mb-6"
            >
              사람이 반려견에게 건강하다고 할 수 있는 안전한 간식을
              올바르게 선택할 수 있도록 꼬순박스가 시작했습니다.
            </Text>
            <div className="flex gap-3 text-xl" aria-hidden>
              <span>🐾</span>
              <span>🧡</span>
              <span>🐕</span>
            </div>
          </div>

          {/* Right — 사진 그리드 */}
          <div className="flex-1 w-full max-w-[420px] md:max-w-none">
            <div className="relative flex gap-3 items-start">
              {/* 메인 사진 (노란 배경 코기) */}
              <div className="flex-1 rounded-2xl overflow-hidden bg-[var(--color-photo-bg-yellow)] aspect-[3/4] flex items-center justify-center">
                <span className="text-7xl" aria-hidden>🐕</span>
                <span className="sr-only">코기 사진 1</span>
              </div>
              {/* 보조 사진 (보라 배경 코기) — 아래로 오프셋 */}
              <div className="flex-1 mt-10 flex flex-col gap-3">
                <div className="rounded-2xl overflow-hidden bg-[var(--color-photo-bg-lavender)] aspect-[3/4] flex items-center justify-center">
                  <span className="text-6xl" aria-hidden>🐶</span>
                  <span className="sr-only">코기 사진 2</span>
                </div>
                {/* Prettykim 크레딧 */}
                <Text variant="caption-12-r" className="text-[var(--color-text-secondary)] text-right pr-1">
                  Prettykim
                </Text>
              </div>
              {/* 로고 배지 */}
              <div className="absolute -top-3 right-[46%] bg-white rounded-xl px-3 py-2 shadow-md z-10">
                <Image src={logoMain} alt="꼬순박스" className="w-[72px] h-auto" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ━━━━ Section 2: 믿을 수 있는 건강한 간식 ━━━━ */}
      <section className="bg-[var(--color-secondary)] py-14 md:py-[72px]">
        <div className="mx-auto max-w-[var(--max-width-content)] px-6 md:px-8 flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Left — 음식 이미지 플레이스홀더 */}
          <div className="flex-1 w-full flex justify-center">
            <div
              className="w-full max-w-[320px] md:max-w-[360px] aspect-square rounded-2xl flex items-center justify-center"
              style={{ background: "var(--color-divider-warm)" }}
            >
              <span className="text-8xl" aria-hidden>🍰</span>
              <span className="sr-only">건강한 수제 간식 이미지</span>
            </div>
          </div>

          {/* Right — 텍스트 */}
          <div className="flex-1 w-full">
            <Text
              as="p"
              variant="body-14-m"
              mobileVariant="body-13-r"
              className="text-[var(--color-amber)] mb-1"
            >
              믿을 수 있는
            </Text>
            <Text
              as="h2"
              variant="title-32-b"
              mobileVariant="title-24-b"
              className="text-[var(--color-brown-dark)] mb-6"
            >
              건강한 간식
            </Text>
            <Text
              variant="body-16-r"
              mobileVariant="body-14-r"
              className="text-[var(--color-text-body-warm)] mb-4"
            >
              꼬순박스는 간식의 원재료부터 제조까지<br />
              우리 아이 건강을 위해 합성 첨가물·방부제 없이 정직하게 만들었습니다.
            </Text>
            <Text
              variant="body-16-r"
              mobileVariant="body-14-r"
              className="text-[var(--color-text-warm)]"
            >
              좋은 재료로 정성껏 만든 꼬순박스의<br />
              간식으로 안전한 간식을 경험해보세요.
            </Text>
          </div>

        </div>
      </section>

      {/* ━━━━ Section 3: 피처 카드 3개 ━━━━ */}
      <section className="bg-white py-14 md:py-[72px]">
        <div className="mx-auto max-w-[var(--max-width-content)] px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard
              icon={<LeafIcon />}
              iconBg="rgba(63, 105, 0, 0.12)"
              title="건강한 재료"
              description="100% 국내산 휴먼그레이드 재료만 엄선하여 합성 첨가물 없이 제조합니다."
            />
            <FeatureCard
              icon={<HeartIcon />}
              iconBg="rgba(240, 127, 61, 0.12)"
              title="장난기 가득 수제간식"
              description="사람이 직접 손으로 만든 수제 간식으로 우리 아이에게 기쁨을 드립니다."
            />
            <FeatureCard
              icon={<DogIcon />}
              iconBg="rgba(238, 104, 26, 0.10)"
              title="우리 아이 맞춤 간식"
              description="반려견의 연령·체중·알레르기에 맞춘 300g 단위 맞춤 패키지로 구성됩니다."
            />
          </div>
        </div>
      </section>

      {/* ━━━━ Section 4: CTA ━━━━ */}
      <section className="bg-[var(--color-brown-dark)] py-14 md:py-[72px]">
        <div className="mx-auto max-w-[var(--max-width-content)] px-6 md:px-8">
          <Text
            as="h2"
            variant="title-24-sb"
            mobileVariant="subtitle-18-b"
            className="text-white text-center mb-8 md:mb-10"
          >
            건강하고 안전한 간식을 선물하세요!
          </Text>

          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Left — 스택 카드 2개 */}
            <div className="flex flex-col gap-4 flex-1">
              {/* 로고 카드 */}
              <div className="bg-[var(--color-primary)] rounded-2xl flex items-center justify-center py-6 px-6 gap-3">
                <Image src={logoMain} alt="꼬순박스" className="w-[96px] h-auto brightness-0 invert" />
                <span className="text-white text-2xl" aria-hidden>🐾</span>
              </div>
              {/* 세이지 텍스트 카드 */}
              <div className="bg-[var(--color-sage)] rounded-2xl px-6 py-6 flex items-center">
                <Text
                  as="p"
                  variant="subtitle-18-b"
                  mobileVariant="subtitle-16-sb"
                  className="text-white leading-relaxed"
                >
                  우리 아이의<br />
                  행복한 간식 시간을<br />
                  꼬순박스와 함께하세요.
                </Text>
              </div>
            </div>

            {/* Right — 상품 이미지 플레이스홀더 */}
            <div className="flex-1 flex items-center justify-center">
              <div
                className="w-full rounded-2xl flex items-center justify-center py-12"
                style={{ background: "var(--color-amber)" }}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-6xl" aria-hidden>📦</span>
                  <span className="text-5xl -mt-4 rotate-6" aria-hidden>📦</span>
                  <span className="sr-only">꼬순박스 상품 이미지</span>
                </div>
              </div>
            </div>
          </div>

          {/* 구독 CTA 링크 */}
          <div className="flex justify-center mt-8">
            <Link
              href="/subscribe"
              className="inline-flex items-center justify-center rounded-full bg-white text-[var(--color-brown-dark)] px-8 h-[52px] text-subtitle-16-sb hover:bg-[var(--color-secondary)] transition-colors"
            >
              구독 시작하기
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
