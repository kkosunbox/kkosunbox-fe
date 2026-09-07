import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchReferralPage } from "@/features/referral/api/queries";
import {
  ReferralHeroSection,
  ReferralOfferHeroSection,
} from "@/widgets/home/referral-hero";
import { StatsBar } from "@/widgets/home/stats-bar";
import { ReferralPackagePlansSection } from "@/widgets/home/referral-package-plans";
import { WhyGallerySection } from "@/widgets/home/why-gallery";
import { ReviewsSection } from "@/widgets/home/reviews";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchReferralPage(slug);
  if (!data || !data.isActive || !data.isPageVisible) return {};
  return {
    title: `${data.displayName}님의 초대 | 꼬순박스`,
    description: `${data.displayName}님의 초대로 꼬순박스를 ${Math.round(data.discountRate * 100)}% 할인받아 시작하세요.`,
  };
}

export default async function ReferralLandingPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchReferralPage(slug);

  if (!data || !data.isActive) {
    redirect("/");
  }

  // 적격 판정(구독 이력 확인 포함)은 서버 단일 resolver가 담당한다. layout이 proxy.ts의
  // landingSlug 헤더로 이미 이 slug 기준 context를 확정해 ReferralProvider로 내려주므로,
  // 여기서 따로 계산하지 않는다 — 중첩 Provider를 만들면 쿠키 기록 effect가 경합한다.
  return (
    <div className="pt-[var(--banner-height)]">
      <div className="relative z-0">
        {data.isPageVisible ? (
          <ReferralHeroSection />
        ) : (
          <ReferralOfferHeroSection />
        )}
      </div>
      <div className="relative z-[1]">
        <StatsBar />
        <ReferralPackagePlansSection />
        <WhyGallerySection />
        <ReviewsSection />
      </div>
    </div>
  );
}
