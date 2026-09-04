import type { Metadata } from "next";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveReferralContext } from "@/features/referral/lib/resolveReferralContext";
import { SubscribePlansSection } from "@/widgets/subscribe/plans";
import { JsonLd } from "@/shared/ui";
import { SITE_URL } from "@/shared/lib/seo";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";

const description = "베이직부터 프리미엄까지, 우리 강아지에게 맞는 구독 플랜을 선택하세요. 매달 신선한 수제간식이 배송됩니다.";

const breadcrumbJsonLd = {
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "구독 플랜", item: `${SITE_URL}/subscribe` },
  ],
};

export const metadata: Metadata = {
  title: "구독 플랜 | 꼬순박스",
  description,
  alternates: { canonical: "/subscribe" },
  openGraph: {
    title: "구독 플랜 | 꼬순박스",
    description,
    url: "/subscribe",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "구독 플랜 | 꼬순박스",
    description,
    images: ["/og-image.png"],
  },
};

function buildSubscriptionJsonLd(plans: SubscriptionPlanDto[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd,
      {
        "@type": "ItemList",
        name: "꼬순박스 강아지 수제간식 정기구독 플랜",
        url: `${SITE_URL}/subscribe`,
        numberOfItems: plans.length,
        itemListElement: plans.map((plan, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: plan.name,
            description:
              plan.description ?? `${plan.name} 강아지 맞춤 수제간식 정기구독 플랜`,
            url: `${SITE_URL}/subscribe/detail?planId=${plan.id}`,
            brand: { "@type": "Brand", name: "꼬순박스" },
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/subscribe/detail?planId=${plan.id}`,
              priceCurrency: "KRW",
              price: plan.monthlyPrice,
            },
          },
        })),
      },
    ],
  };
}

export default async function SubscribePage() {
  const token = await getServerToken();
  // 초대 맥락이 있으면 코드를 함께 넘겨 서버가 채운 할인가를 그대로 표시한다.
  const { refCode } = await resolveReferralContext();
  const plans = await fetchSubscriptionPlans(token, undefined, refCode ?? undefined);

  return (
    <>
      <h1 className="sr-only">강아지 수제간식 정기구독 플랜</h1>
      <JsonLd data={buildSubscriptionJsonLd(plans)} />
      <SubscribePlansSection plans={plans} />
    </>
  );
}
