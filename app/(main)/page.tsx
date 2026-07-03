import type { Metadata } from "next";
import { HomeHero } from "@/widgets/home/hero";
import { StatsBar } from "@/widgets/home/stats-bar";
import { HomePackagePlansSection } from "@/widgets/home/package-plans";
import { WhyGallerySection } from "@/widgets/home/why-gallery";
import { ReviewsSection } from "@/widgets/home/reviews";

const description = "믿을 수 있는 재료로 만든 수제간식을 매월 문 앞에. 우리 강아지를 위한 프리미엄 정기구독 서비스.";

export const metadata: Metadata = {
  title: "꼬순박스 — 프리미엄 강아지 수제간식 구독",
  description,
  openGraph: {
    title: "꼬순박스 — 프리미엄 강아지 수제간식 구독",
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "꼬순박스 — 프리미엄 강아지 수제간식 구독",
    description,
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return (
    <div className="pt-[var(--banner-height)]">
      {/* 페이지 단일 시맨틱 h1 — Hero가 이미지 헤딩이라 검색엔진/스크린리더용 텍스트 제목을 제공한다. */}
      <h1 className="sr-only">
        꼬순박스 — 100% 국내산 휴먼그레이드 강아지 수제간식 정기구독
      </h1>
      <div className="relative z-0">
        <HomeHero />
      </div>
      <div className="relative z-[1]">
        <StatsBar />
        <HomePackagePlansSection />
        <WhyGallerySection />
        <ReviewsSection />
      </div>
    </div>
  );
}
