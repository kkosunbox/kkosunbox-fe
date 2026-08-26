import PartnershipHeroDesktop from "../assets/partnership-hero-desktop.webp";
import PartnershipHeroMobile from "../assets/partnership-hero-mobile.webp";
import PartnershipHeroTablet from "../assets/partnership-hero-tablet.webp";
import { DesktopHeroSideBackground } from "@/shared/ui";

const HERO_ALT = "꼬순박스를 더 풍성하게 만들어갈 파트너를 기다립니다.";

export function PartnershipHero() {
  return (
    <section className="relative w-full overflow-hidden" aria-label="제휴·입점 문의 안내">
      {/* 모바일 (< 768px) */}
      <div className="flex h-[calc(156px+var(--banner-height))] w-full items-end overflow-hidden md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- 제공된 2x 배너 원본을 화면 분기별로 그대로 사용 */}
        <img
          src={PartnershipHeroMobile.src}
          alt={HERO_ALT}
          width={PartnershipHeroMobile.width}
          height={PartnershipHeroMobile.height}
          className="h-[156px] w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* 태블릿 (768px~1199px) */}
      <div className="max-md:hidden lg:hidden flex h-[calc(156px+var(--banner-height))] w-full items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- 제공된 2x 배너 원본을 화면 분기별로 그대로 사용 */}
        <img
          src={PartnershipHeroTablet.src}
          alt={HERO_ALT}
          width={PartnershipHeroTablet.width}
          height={PartnershipHeroTablet.height}
          className="h-[156px] w-full shrink-0 object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* 데스크톱 (≥ 1200px) */}
      <div className="max-lg:hidden flex h-[calc(306px+var(--banner-height))] w-full items-end overflow-hidden">
        <div className="relative h-[306px] w-full">
          <DesktopHeroSideBackground />
          <div className="relative mx-auto h-[306px] w-full max-w-[1920px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- 제공된 2x 배너 원본을 화면 분기별로 그대로 사용 */}
            <img
              src={PartnershipHeroDesktop.src}
              alt={`${HERO_ALT} 작은 제안 하나도 소중히 살펴보고, 정성껏 검토하겠습니다.`}
              width={PartnershipHeroDesktop.width}
              height={PartnershipHeroDesktop.height}
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
