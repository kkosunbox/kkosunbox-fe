import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchReferralPage } from "@/features/referral/api/queries";
import { resolveReferralContext } from "@/features/referral/lib/resolveReferralContext";
import { ReferralLandingSync } from "@/features/referral/model";
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

  // 적격 판정(구독 이력 확인 포함)은 서버 단일 resolver가 담당한다. 전체 로드에서는 layout이
  // proxy.ts의 landingSlug 헤더로 이미 같은 값을 확정했고, `resolveReferralContext`가 같은
  // 인자로 `cache()`되므로 여기서 다시 불러도 조회가 늘지 않는다.
  //
  // 그럼에도 이 페이지가 직접 확정하는 이유: 소프트 내비게이션(`/r/A` → `/r/B`, 뒤로가기)에서는
  // Next가 layout을 다시 렌더하지 않아 layout의 값이 A로 굳는다. 매 이동마다 다시 렌더되는 쪽은
  // 이 페이지 세그먼트뿐이다. 중첩 Provider를 만들면 쿠키 기록 effect가 경합하므로
  // `ReferralLandingSync`로 **값만** 올려보내고, 쿠키 쓰기는 상위 Provider 하나가 계속 담당한다.
  const referral = await resolveReferralContext(slug);

  return (
    <div className="pt-[var(--banner-height)]">
      <ReferralLandingSync context={referral} />
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
