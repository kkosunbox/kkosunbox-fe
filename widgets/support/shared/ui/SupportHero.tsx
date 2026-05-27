import Link from "next/link";
import { PAGE_CONTENT_WRAPPER_CLASS } from "@/shared/config/layout";
import SupportHeroBg from "../assets/support-hero-bg.png";

export function SupportHero({ showButton = true }: { showButton?: boolean }) {
  return (
    <section className="relative w-full overflow-hidden" aria-label="1:1 문의 안내">
      {/* eslint-disable-next-line @next/next/no-img-element -- 초광폭 배너 PNG, next/image 재인코딩·다운스케일 시 엣지 노이즈 방지 */}
      <img
        src={SupportHeroBg.src}
        alt="꼬순박스에 궁금한 점이 있으신가요? 1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다."
        width={SupportHeroBg.width}
        height={SupportHeroBg.height}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
        fetchPriority="high"
        decoding="async"
      />
      {/* xl+: 배너 비율(1920×118)에 맞춰 높이 확장 → 와이드 가로 업스케일 완화 */}
      <div
        className={`relative z-10 ${PAGE_CONTENT_WRAPPER_CLASS} flex min-h-[118px] items-center justify-end py-5 md:py-0 lg:py-0 xl:min-h-[max(118px,calc(100vw*118/1920))] xl:py-0`}
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
    </section>
  );
}
