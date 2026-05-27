import Link from "next/link";
import { PAGE_CONTENT_WRAPPER_CLASS } from "@/shared/config/layout";
import SupportHeroBg from "../assets/support-hero-bg.png";

export function SupportHero({ showButton = true }: { showButton?: boolean }) {
  const heroMinHeightClass =
    "min-h-[118px] xl:min-h-[max(118px,calc(100vw*118/1920))]";

  return (
    <section className="relative w-full overflow-hidden" aria-label="1:1 문의 안내">
      {/* xl+: 배너 비율(1920×118)에 맞춰 높이 확장 → 와이드에서도 가로·세로 비율 유지 */}
      <div className={`relative w-full overflow-hidden ${heroMinHeightClass}`}>
        {/* 좁은 뷰포트: 1920px 원본을 높이 기준으로 맞추고 가로 중앙 크롭 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- 초광폭 배너 PNG, next/image 재인코딩·다운스케일 시 엣지 노이즈 방지 */}
          <img
            src={SupportHeroBg.src}
            alt="꼬순박스에 궁금한 점이 있으신가요? 1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다."
            width={SupportHeroBg.width}
            height={SupportHeroBg.height}
            className="h-full w-auto max-w-none shrink-0"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div
          className={`relative z-10 ${PAGE_CONTENT_WRAPPER_CLASS} flex ${heroMinHeightClass} items-center justify-end py-5 md:py-0 lg:py-0 xl:py-0`}
        >
          {showButton && (
            <Link
              href="/inquiry"
              className="inline-flex h-10 w-[148px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-cta-button)] px-6 text-center text-body-14-sb leading-[1.5] tracking-[-0.02em] text-white"
            >
              문의하기
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
