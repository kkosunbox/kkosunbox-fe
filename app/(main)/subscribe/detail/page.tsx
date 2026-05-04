import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscribeProductDetailPage } from "@/widgets/subscribe/plans";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}): Promise<Metadata> {
  const { planId: planIdStr } = await searchParams;
  const planId = Number(planIdStr);

  const ogImage = { url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" };

  if (!Number.isFinite(planId) || planId <= 0) {
    return {
      title: "플랜 상세보기 | 꼬순박스",
      openGraph: { images: [ogImage] },
      twitter: { card: "summary_large_image", images: ["/og-image.png"] },
    };
  }

  try {
    const token = await getServerToken();
    const plans = await fetchSubscriptionPlans(token);
    const plan = plans.find((p) => p.id === planId) ?? plans[0];

    if (!plan) {
      return {
        title: "플랜 상세보기 | 꼬순박스",
        openGraph: { images: [ogImage] },
        twitter: { card: "summary_large_image", images: ["/og-image.png"] },
      };
    }

    const description =
      plan.description ??
      `꼬순박스 ${plan.name} 플랜 — 월 ${plan.monthlyPrice.toLocaleString("ko-KR")}원으로 강아지 맞춤 수제간식을 정기배송 받아보세요.`;

    return {
      title: `${plan.name} 플랜 상세 | 꼬순박스`,
      description,
      openGraph: {
        title: `${plan.name} 플랜 상세 | 꼬순박스`,
        description,
        images: [ogImage],
      },
      twitter: {
        card: "summary_large_image",
        title: `${plan.name} 플랜 상세 | 꼬순박스`,
        description,
        images: ["/og-image.png"],
      },
    };
  } catch {
    return {
      title: "플랜 상세보기 | 꼬순박스",
      openGraph: { images: [ogImage] },
      twitter: { card: "summary_large_image", images: ["/og-image.png"] },
    };
  }
}

export default async function SubscribeDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId: planIdStr } = await searchParams;
  const planId = Number(planIdStr);
  if (!Number.isFinite(planId) || planId <= 0) {
    redirect("/subscribe");
  }

  const token = await getServerToken();
  const plans = await fetchSubscriptionPlans(token);

  if (plans.length === 0) {
    redirect("/subscribe");
  }

  const selectedPlan = plans.find((plan) => plan.id === planId) ?? plans[0];

  return <SubscribeProductDetailPage initialPlan={selectedPlan} plans={plans} />;
}
