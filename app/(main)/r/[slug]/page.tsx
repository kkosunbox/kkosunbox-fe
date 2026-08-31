import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchReferralPage } from "@/features/referral/api/queries";
import { ReferralProvider } from "@/features/referral/model";
import { resolveReferralContext } from "@/features/referral/lib/resolveReferralContext";
import { ReferralHeroSection } from "@/widgets/home/referral-hero";
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

  if (!data.isPageVisible) {
    // 전용 페이지만 숨긴 활성 초대는 추천 관계를 유지해야 한다.
    // 기존 `?r=CODE` 캡처 경로(proxy.ts)를 거치면 쿠키를 심은 뒤 깨끗한 홈 URL로 이동한다.
    redirect(`/?r=${encodeURIComponent(data.referralCode)}`);
  }

  // 적격 판정(구독 이력 확인 포함)은 서버 단일 resolver가 담당한다. 이 페이지가 따로 계산하면
  // layout이 만든 값과 어긋나 같은 유저에게 /r/{slug}와 /subscribe가 다른 가격을 보여주게 된다.
  const referral = await resolveReferralContext(slug);

  return (
    <ReferralProvider context={referral}>
      <div className="pt-[var(--banner-height)]">
        <div className="relative z-0">
          <ReferralHeroSection />
        </div>
        <div className="relative z-[1]">
          <StatsBar />
          <ReferralPackagePlansSection />
          <WhyGallerySection />
          <ReviewsSection />
        </div>
      </div>
    </ReferralProvider>
  );
}
