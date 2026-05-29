import Link from "next/link";
import SupportHeroBg from "../assets/support-hero-bg.png";
import InquiryHeroBannerMobile from "../assets/inquiry-hero-banner.png";

export function SupportHero({ showButton = true }: { showButton?: boolean }) {
  return (
    <section className="relative w-full overflow-hidden" aria-label="1:1 문의 안내">
      {/* 모바일 (< 910px): 단일 배너(111px 고정, 가로 중앙 정렬) */}
      <div className="relative h-[111px] w-full overflow-hidden md2:hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 배너 원본 품질 유지 */}
          <img
            src={InquiryHeroBannerMobile.src}
            alt="꼬순박스에 궁금한 점을 작성해주세요. 1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다."
            width={InquiryHeroBannerMobile.width}
            height={InquiryHeroBannerMobile.height}
            className="h-[111px] w-auto max-w-none shrink-0"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>

      {/* 데스크톱 (≥ 910px): 배너 + 문의하기 버튼 */}
      {/* lg+(≥1200px): max-w-content(1012px)로 제한 — 헤더·컨테이너와 통일감 */}
      <div className="max-md2:hidden lg:mx-auto lg:max-w-content">
        <div className="relative h-[118px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- 초광폭 배너 PNG, next/image 재인코딩·다운스케일 시 엣지 노이즈 방지 */}
          <img
            src={SupportHeroBg.src}
            alt="꼬순박스에 궁금한 점이 있으신가요? 1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다."
            width={SupportHeroBg.width}
            height={SupportHeroBg.height}
            className="pointer-events-none absolute top-0 left-1/2 h-full w-auto max-w-none shrink-0 -translate-x-1/2"
            fetchPriority="high"
            decoding="async"
          />
          {showButton && (
            <div className="absolute inset-0 z-10 flex items-center justify-end max-lg:px-8 lg:pr-[44px]">
              <Link
                href="/inquiry"
                className="inline-flex h-10 w-[148px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-cta-button)] px-6 text-center text-body-14-sb leading-[1.5] tracking-[-0.02em] text-white"
              >
                문의하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
