import type { ShopGlyph } from "@/entities/product";

/** 글리프별 라인 일러스트 — 64×64 viewBox, currentColor 스트로크 */
function GlyphPath({ glyph }: { glyph: ShopGlyph }) {
  switch (glyph) {
    case "ball":
      return (
        <>
          <circle cx="24" cy="38" r="12" />
          <circle cx="42" cy="30" r="10" />
          <path d="M20 36l2 2M27 34l2 2M40 27l2 2" strokeLinecap="round" />
        </>
      );
    case "stick":
      return (
        <>
          <rect x="14" y="26" width="36" height="12" rx="6" transform="rotate(-12 32 32)" />
          <path d="M20 28c3-2 6 2 9 0s6 2 9 0 6 2 9 0" strokeLinecap="round" transform="rotate(-12 32 32)" />
        </>
      );
    case "chip":
      return (
        <>
          <path d="M18 42c-4-8 2-18 11-19s16 5 15 13-8 12-14 12-10-2-12-6Z" />
          <path d="M27 31l1.5 1.5M35 30l1.5 1.5M31 38l1.5 1.5" strokeLinecap="round" />
        </>
      );
    case "bone":
      return (
        <path d="M22 26a5 5 0 1 0-6 8 5 5 0 1 0 6 8c1.5-1.2 3.5-2 6-2h8c2.5 0 4.5.8 6 2a5 5 0 1 0 6-8 5 5 0 1 0-6-8c-1.5 1.2-3.5 2-6 2h-8c-2.5 0-4.5-.8-6-2Z" />
      );
    case "riceball":
      return (
        <>
          <path d="M32 18c3 0 5 2 8 7l6 10c2 4 1 9-5 9H23c-6 0-7-5-5-9l6-10c3-5 5-7 8-7Z" />
          <rect x="27" y="34" width="10" height="10" rx="2" />
        </>
      );
    case "bowl":
      return (
        <>
          <path d="M14 34h36c0 8-6 14-13 14h-10c-7 0-13-6-13-14Z" />
          <path d="M26 26c-2-3 2-4 0-7M32 27c-2-3 2-4 0-7M38 26c-2-3 2-4 0-7" strokeLinecap="round" />
        </>
      );
  }
}

/**
 * 단품 상품 placeholder 아트 — 실사진 자산 확보 전까지 사용.
 * 부모가 크기를 결정(w-full/aspect 등)하고, 이 컴포넌트는 배경+글리프만 그린다.
 * 실사진 도입 시 이 컴포넌트 사용처를 next/image로 교체한다.
 */
export function ShopProductArt({
  glyph,
  colorVar,
  className = "",
}: {
  glyph: ShopGlyph;
  colorVar: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[var(--color-surface-warm)] ${className}`}
    >
      {/* 상품 컬러의 은은한 원형 배경 */}
      <div
        className="absolute h-[68%] w-[68%] rounded-full opacity-[0.12]"
        style={{ background: colorVar }}
      />
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="relative h-[52%] w-[52%] transition-transform duration-300 group-hover:scale-110"
        style={{ color: colorVar }}
      >
        <GlyphPath glyph={glyph} />
      </svg>
    </div>
  );
}
