import type { Metadata } from "next";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveReferralContext } from "@/features/referral/lib/resolveReferralContext";
import { SubscribePlansSection } from "@/widgets/subscribe/plans";
import { JsonLd } from "@/shared/ui";
import { SITE_URL, PRODUCT_SHIPPING_DETAILS_JSONLD, PRODUCT_RETURN_POLICY_JSONLD } from "@/shared/lib/seo";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import { PACKAGES, TIER_BOX_IMAGES, tierFromSubscriptionPlan } from "@/entities/package";

const description = "베이직부터 프리미엄까지, 우리 강아지에게 맞는 구독 플랜을 선택하세요. 매달 신선한 수제간식이 배송됩니다.";
const subscribeTitle = "구독몰 | 강아지 수제간식 구독 플랜 - 꼬순박스";

const breadcrumbJsonLd = {
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "구독몰", item: `${SITE_URL}/subscribe` },
  ],
};

export const metadata: Metadata = {
  title: subscribeTitle,
  description,
  alternates: { canonical: "/subscribe" },
  openGraph: {
    title: subscribeTitle,
    description,
    url: "/subscribe",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: subscribeTitle,
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
              plan.description || `${plan.name} 강아지 맞춤 수제간식 정기구독 플랜`,
            image: `${SITE_URL}${TIER_BOX_IMAGES[tierFromSubscriptionPlan(plan)].src}`,
            url: `${SITE_URL}/subscribe/detail?planId=${plan.id}`,
            brand: { "@type": "Brand", name: "꼬순박스" },
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/subscribe/detail?planId=${plan.id}`,
              priceCurrency: "KRW",
              price: plan.monthlyPrice,
              availability: "https://schema.org/InStock",
              shippingDetails: PRODUCT_SHIPPING_DETAILS_JSONLD,
              hasMerchantReturnPolicy: PRODUCT_RETURN_POLICY_JSONLD,
            },
          },
        })),
      },
    ],
  };
}

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const token = await getServerToken();
  // 초대 맥락이 있으면 코드를 함께 넘겨 서버가 채운 할인가를 그대로 표시한다.
  const { refCode } = await resolveReferralContext();
  const plans = await fetchSubscriptionPlans(token, undefined, refCode ?? undefined);

  // 띠배너 등 특정 진입 경로에서만 초기 선택 티어를 지정 — 일반 진입 시에는 PlanPicker 기본값을 따른다.
  const { tier } = await searchParams;
  const initialSelectedTier = PACKAGES.find((item) => item.tier === tier)?.tier ?? null;

  return (
    <>
      <h1 className="sr-only">강아지 수제간식 정기구독 플랜</h1>
      <JsonLd data={buildSubscriptionJsonLd(plans)} />
      <SubscribePlansSection plans={plans} initialSelectedTier={initialSelectedTier} />
    </>
  );
}
