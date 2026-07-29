import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchReferralPage } from "@/features/referral/api/queries";
import { ReferralProvider } from "@/features/referral/model";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptions } from "@/features/subscription/api/queries";
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
  if (!data) return {};
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

  // 이미 구독 이력이 있는 방문자(본인 링크 재방문 포함)에게는 첫 달 할인 배지를 보여주지 않는다.
  const token = await getServerToken().catch(() => null);
  const subscriptions = token ? await fetchSubscriptions(token).catch(() => []) : [];
  const hasSubscriptionHistory = subscriptions.length > 0;

  return (
    <ReferralProvider
      initialData={{
        slug,
        refCode: data.referralCode,
        discountRate: data.discountRate,
        influencerName: data.displayName,
        profileImageUrl: data.profileImageUrl,
      }}
      hasSubscriptionHistory={hasSubscriptionHistory}
    >
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
