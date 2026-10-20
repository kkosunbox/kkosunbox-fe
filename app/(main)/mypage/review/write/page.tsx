import dynamic from "next/dynamic";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProduct } from "@/features/product/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { getPackageTierBySlug, TIER_BOX_IMAGES } from "@/entities/package";
import type { ReviewTargetInfo } from "@/widgets/mypage/ui/ReviewWriteSection";

const ReviewWriteSection = dynamic(
  () => import("@/widgets/mypage/ui/ReviewWriteSection"),
);

export const metadata = { title: "리뷰쓰기 | 꼬순박스" };

function toPositiveInt(value: string | undefined): number | null {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** 리뷰 대상(구독 플랜 또는 스토어 상품) 표시 정보. 조회 실패 시 화면은 상품 정보 없이 그대로 동작한다 */
async function fetchReviewTarget(planId: number | null, productId: number | null): Promise<ReviewTargetInfo | null> {
  const token = await getServerToken();
  if (planId) {
    const plan = (await fetchSubscriptionPlans(token)).find((item) => item.id === planId);
    if (!plan) return null;
    const tier = getPackageTierBySlug(plan.slug ?? "");
    return { name: plan.name, imageUrl: plan.imageUrl || (tier ? TIER_BOX_IMAGES[tier].src : null), kind: "subscription" };
  }
  if (productId) {
    const product = await fetchProduct(productId, token);
    return product ? { name: product.name, imageUrl: product.imageUrl ?? null, kind: "product" } : null;
  }
  return null;
}

export default async function ReviewWritePage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; productId?: string; productOrderId?: string; reviewId?: string }>;
}) {
  const {
    planId: planIdStr,
    productId: productIdStr,
    productOrderId: productOrderIdStr,
    reviewId: reviewIdStr,
  } = await searchParams;
  const planId = toPositiveInt(planIdStr);
  const productId = toPositiveInt(productIdStr);
  const productOrderId = toPositiveInt(productOrderIdStr);
  const reviewId = toPositiveInt(reviewIdStr);
  const target = await fetchReviewTarget(planId, productId);

  return (
    <ReviewWriteSection
      target={target}
      planId={planId}
      productId={productId}
      productOrderId={productOrderId}
      reviewId={reviewId}
    />
  );
}
