import SupportHeroBg from "../assets/support-hero-bg-renewal.webp";
import SupportHeroTablet from "../assets/support-hero-tablet-renewal.webp";
import InquiryHeroBannerMobile from "../assets/support-hero-mobile-renewal.webp";

export function SupportHero() {
  return (
    <section className="relative w-full overflow-hidden" aria-label="1:1 문의 안내">
      {/* 모바일 (< 768px) */}
      <div className="flex h-[calc(156px+var(--banner-height))] w-full items-end overflow-hidden md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 배너 원본 품질 유지 */}
        <img
          src={InquiryHeroBannerMobile.src}
          alt="꼬순박스에 궁금한 점이 있으신가요?"
          width={InquiryHeroBannerMobile.width}
          height={InquiryHeroBannerMobile.height}
          className="h-[156px] w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* 태블릿 (768px~1199px) */}
      <div className="max-md:hidden lg:hidden flex h-[calc(156px+var(--banner-height))] w-full items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 배너 원본 품질 유지 */}
        <img
          src={SupportHeroTablet.src}
          alt="꼬순박스에 궁금한 점이 있으신가요?"
          width={SupportHeroTablet.width}
          height={SupportHeroTablet.height}
          className="h-[156px] w-full shrink-0 object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* 데스크톱 (≥ 1200px): 초광폭(>1920px)에서는 좌우를 support-hero-side-bg로 채워 이미지 부족 영역 보완 */}
      <div className="max-lg:hidden flex h-[calc(306px+var(--banner-height))] w-full items-end overflow-hidden">
        <div className="relative w-full h-[306px]">
          <div className="absolute inset-x-0 top-0 h-[256px] w-full bg-support-hero-side-bg" />
          <div className="relative mx-auto h-[306px] w-full max-w-[1920px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- 초광폭 배너 PNG, next/image 재인코딩·다운스케일 시 엣지 노이즈 방지 */}
            <img
              src={SupportHeroBg.src}
              alt="꼬순박스에 궁금한 점이 있으신가요? 1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다."
              width={SupportHeroBg.width}
              height={SupportHeroBg.height}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
