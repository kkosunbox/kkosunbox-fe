import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchReferralPage } from "@/features/referral/api/queries";
import { ReferralProvider } from "@/features/referral/model";
import { HomeHero } from "@/widgets/home/hero";
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

  return (
    <ReferralProvider
      initialData={{
        slug,
        refCode: data.referralCode,
        discountRate: data.discountRate,
        influencerName: data.displayName,
        profileImageUrl: data.profileImageUrl,
      }}
    >
      <div className="pt-[var(--banner-height)]">
        <div className="sticky top-[var(--banner-height)] z-0">
          <HomeHero />
          <StatsBar />
        </div>
        <div className="relative z-[1]">
          <ReferralPackagePlansSection />
          <WhyGallerySection />
          <ReviewsSection />
        </div>
      </div>
    </ReferralProvider>
  );
}
