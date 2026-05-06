import type { Metadata } from "next";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscribePlansSection } from "@/widgets/subscribe/plans";

const description = "베이직부터 프리미엄까지, 우리 강아지에게 맞는 구독 플랜을 선택하세요. 매달 신선한 수제간식이 배송됩니다.";

export const metadata: Metadata = {
  title: "구독 플랜 | 꼬순박스",
  description,
  openGraph: {
    title: "구독 플랜 | 꼬순박스",
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "구독 플랜 | 꼬순박스",
    description,
    images: ["/og-image.png"],
  },
};

export default async function SubscribePage() {
  const token = await getServerToken();
  const profile = await fetchProfile(token);
  const plans = await fetchSubscriptionPlans(token, profile?.id);

  return <SubscribePlansSection plans={plans} initialProfile={profile} />;
}
