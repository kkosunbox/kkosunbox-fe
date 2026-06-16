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
      <div className="sticky top-[var(--banner-height)] z-0">
        <HomeHero />
        <StatsBar />
      </div>
      <div className="relative z-[1]">
        <HomePackagePlansSection />
        <WhyGallerySection />
        <ReviewsSection />
      </div>
    </div>
  );
}
