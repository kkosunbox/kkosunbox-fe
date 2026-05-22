"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import logoMain from "@/shared/assets/logo-main.svg";

type GalleryItem =
  | { type: "img"; bg: string }
  | { type: "cta"; bg: string; text: string; wide: boolean };

function ArrowButton() {
  return (
    <div
      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-[2px_2px_4px_rgba(0,0,0,0.12)]"
      style={{ background: "rgba(255,255,255,0.5)" }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M5 3L9 7L5 11"
          stroke="#2F2F2F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PawDeco() {
  return (
    <div className="absolute top-3 right-4 flex gap-2 pointer-events-none select-none opacity-40">
      <span className="text-[28px] lg:text-[32px] rotate-[-15deg] inline-block">🐾</span>
      <span className="text-[18px] lg:text-[22px] mt-3 rotate-[10deg] inline-block">🐾</span>
    </div>
  );
}

function GalleryCTACard({
  bg,
  text,
  onClick,
  wide,
}: {
  bg: string;
  text: string;
  onClick: () => void;
  wide: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={text}
      className={[
        "relative overflow-hidden rounded-[20px] shrink-0 flex flex-col justify-between text-left p-5 transition-opacity hover:opacity-90",
        wide
          ? "w-[300px] lg:w-[420px] xl:w-[547px] h-[190px] lg:h-[220px] xl:h-[268px]"
          : "w-[190px] lg:w-[240px] xl:w-[289px] h-[190px] lg:h-[220px] xl:h-[268px]",
      ].join(" ")}
      style={{ background: bg }}
    >
      <PawDeco />
      <div className="flex items-center gap-1.5">
        <Image src={logoMain} alt="꼬순박스" className="h-auto w-[64px] lg:w-[76px] xl:w-[90px]" />
      </div>
      <div className="flex items-end justify-between gap-3">
        <p
          className="font-bold text-[14px] lg:text-[18px] xl:text-[22px] leading-[1.35] tracking-[-0.04em] whitespace-pre-line"
          style={{ color: "var(--color-gallery-text)" }}
        >
          {text}
        </p>
        <ArrowButton />
      </div>
    </button>
  );
}

function GalleryImageCard({ bg }: { bg: string }) {
  return (
    <div
      className="relative shrink-0 rounded-[20px] overflow-hidden w-[190px] lg:w-[240px] xl:w-[289px] h-[190px] lg:h-[220px] xl:h-[268px]"
      style={{ background: bg }}
      aria-hidden="true"
    />
  );
}

const ROW_1_BASE: GalleryItem[] = [
  { type: "img", bg: "var(--color-secondary)" },
  { type: "img", bg: "var(--color-beige)" },
  { type: "img", bg: "var(--color-cta-logo-bg)" },
  {
    type: "cta",
    bg: "var(--color-gallery-cta-peach)",
    text: "우리 아이를 위한\n맞춤 패키지 박스 찾기",
    wide: true,
  },
  { type: "img", bg: "var(--color-secondary)" },
];

const ROW_2_BASE: GalleryItem[] = [
  { type: "img", bg: "var(--color-gallery-cta-peach)" },
  {
    type: "cta",
    bg: "var(--color-cta-sage-bg)",
    text: "우리 아이 수제 간식 구독 패키지,\n간편하게 시작하기",
    wide: true,
  },
  { type: "img", bg: "var(--color-beige)" },
  { type: "img", bg: "var(--color-cta-logo-bg)" },
  { type: "img", bg: "var(--color-cta-sage-bg)" },
];

export default function PhotoGallerySection() {
  const router = useRouter();
  const goSubscribe = () => router.push("/subscribe");

  function renderItem(item: GalleryItem, key: string, wide?: boolean) {
    if (item.type === "cta") {
      return (
        <GalleryCTACard
          key={key}
          bg={item.bg}
          text={item.text}
          onClick={goSubscribe}
          wide={wide !== undefined ? wide : item.wide}
        />
      );
    }
    return <GalleryImageCard key={key} bg={item.bg} />;
  }

  return (
    <section
      className="pb-10 md:pb-14 lg:pb-16"
      style={{ background: "var(--color-why-bg)" }}
    >
      {/* 데스크탑·태블릿: CSS 자동 롤링 */}
      <div className="max-md:hidden flex flex-col gap-4 lg:gap-6 xl:gap-8">
        {/* 행 1 — 오른쪽으로 롤링
            inline-flex: computed width = content width 이 돼야
            translateX(-33.333%)가 정확히 1벌 너비로 계산됨 */}
        <div className="overflow-hidden w-full">
          <div
            className="inline-flex flex-nowrap will-change-transform animate-gallery-right lg:[animation-duration:30s] xl:[animation-duration:38s]"
          >
            {[0, 1, 2].map((copy) => (
              <div key={copy} className="flex gap-4 lg:gap-6 xl:gap-8 flex-nowrap pr-4 lg:pr-6 xl:pr-8">
                {ROW_1_BASE.map((item, i) => renderItem(item, `r1-${copy}-${i}`))}
              </div>
            ))}
          </div>
        </div>

        {/* 행 2 — 왼쪽으로 롤링 */}
        <div className="overflow-hidden w-full">
          <div
            className="inline-flex flex-nowrap will-change-transform animate-gallery-left lg:[animation-duration:30s] xl:[animation-duration:38s]"
          >
            {[0, 1, 2].map((copy) => (
              <div key={copy} className="flex gap-4 lg:gap-6 xl:gap-8 flex-nowrap pr-4 lg:pr-6 xl:pr-8">
                {ROW_2_BASE.map((item, i) => renderItem(item, `r2-${copy}-${i}`))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 모바일: 가로 스크롤 */}
      <div className="md:hidden overflow-x-auto px-5 pb-2 flex flex-col gap-4">
        <div className="flex gap-3" style={{ width: "max-content" }}>
          {ROW_1_BASE.map((item, i) => renderItem(item, `m1-${i}`, false))}
        </div>
        <div className="flex gap-3" style={{ width: "max-content" }}>
          {ROW_2_BASE.map((item, i) => renderItem(item, `m2-${i}`, false))}
        </div>
      </div>
    </section>
  );
}