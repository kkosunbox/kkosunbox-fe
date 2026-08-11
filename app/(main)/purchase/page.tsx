import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseListSection, PurchasePaymentErrorNotice } from "@/widgets/purchase";
import { resolveAverageRatingByTier } from "@/entities/package";
import { fetchProducts } from "@/features/product/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "구매하기 | 꼬순박스",
  ...NOINDEX_METADATA,
};

// 빌드 시점 정적 생성이 이 페이지에서만 반복적으로 60초 타임아웃에 걸려 next build가 실패한다
// (원인 미확정 — Turbopack/webpack 둘 다 동일 재현, 세션 시작 전 커밋에서도 재현되어 오늘 변경과 무관함
// 확인됨). 어차피 NOINDEX + 항상 최신 재고/가격을 보여줘야 하는 페이지라 정적 생성 대상에서 제외해도
// 손해가 없어, 빌드를 막던 지점을 완전히 우회하는 실용적 조치로 동적 렌더링을 강제한다.
export const dynamic = "force-dynamic";

export default async function PurchasePage() {
  const [products, plans] = await Promise.all([fetchProducts(), fetchSubscriptionPlans()]);
  const productsByTier = resolveProductsByTier(products, plans);
  // 별점은 구독 플랜의 실제 평균 별점(`averageRating`)을 그대로 쓴다 — PlanPicker와 동일 소스.
  // 단품과 구독은 같은 박스라 리뷰도 플랜 단위로 쌓인다.
  const ratingByTier = resolveAverageRatingByTier(plans);

  return (
    <>
      <Suspense fallback={null}>
        <PurchasePaymentErrorNotice />
      </Suspense>
      <PurchaseListSection productsByTier={productsByTier} ratingByTier={ratingByTier} />
    </>
  );
}
