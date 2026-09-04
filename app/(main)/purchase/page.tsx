import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseListSection, PurchasePaymentErrorNotice } from "@/widgets/purchase";
import { COMPARE_PACKAGES, TIER_BOX_IMAGES, getPackagePurchaseProduct, resolveAverageRatingByTier } from "@/entities/package";
import { fetchProducts } from "@/features/product/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { JsonLd } from "@/shared/ui";
import { SITE_URL } from "@/shared/lib/seo";

const purchaseTitle = "단품몰 | 강아지 수제간식 단품 - 꼬순박스";

export const metadata: Metadata = {
  title: purchaseTitle,
  description: "꼬순박스의 프리미엄 강아지 수제간식 패키지를 단품으로 만나보세요.",
  alternates: { canonical: "/purchase" },
  openGraph: {
    title: purchaseTitle,
    description: "꼬순박스의 프리미엄 강아지 수제간식 패키지를 단품으로 만나보세요.",
    url: "/purchase",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스 수제간식 단품" }],
  },
  twitter: {
    card: "summary_large_image",
    title: purchaseTitle,
    description: "꼬순박스의 프리미엄 강아지 수제간식 패키지를 단품으로 만나보세요.",
    images: ["/og-image.png"],
  },
};

// 빌드 시점 정적 생성이 이 페이지에서만 반복적으로 60초 타임아웃에 걸려 next build가 실패한다
// (원인 미확정 — Turbopack/webpack 둘 다 동일 재현, 세션 시작 전 커밋에서도 재현되어 오늘 변경과 무관함
// 확인됨). 항상 최신 재고/가격을 보여줘야 하는 페이지이므로 정적 생성 대상에서 제외하고
// 빌드를 막던 지점을 완전히 우회하기 위해 동적 렌더링을 강제한다.
export const dynamic = "force-dynamic";

export default async function PurchasePage() {
  const [products, plans] = await Promise.all([fetchProducts(), fetchSubscriptionPlans()]);
  const productsByTier = resolveProductsByTier(products, plans);
  // 별점은 구독 플랜의 실제 평균 별점(`averageRating`)을 그대로 쓴다 — PlanPicker와 동일 소스.
  // 단품과 구독은 같은 박스라 리뷰도 플랜 단위로 쌓인다.
  const ratingByTier = resolveAverageRatingByTier(plans);
  const productListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "꼬순박스 강아지 수제간식 단품",
    url: `${SITE_URL}/purchase`,
    numberOfItems: COMPARE_PACKAGES.length,
    itemListElement: COMPARE_PACKAGES.map((pkg, index) => {
      const product = productsByTier[pkg.tier];
      const price = product?.price ?? getPackagePurchaseProduct(pkg.tier)!.price;

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product?.name ?? pkg.name,
          description:
            product?.description || `${pkg.name} 휴먼그레이드 강아지 수제간식 단품 패키지`,
          image: product?.imageUrl || `${SITE_URL}${TIER_BOX_IMAGES[pkg.tier].src}`,
          url: `${SITE_URL}/purchase/detail?tier=${pkg.tier}`,
          brand: { "@type": "Brand", name: "꼬순박스" },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/purchase/detail?tier=${pkg.tier}`,
            priceCurrency: "KRW",
            price,
            availability: "https://schema.org/InStock",
          },
        },
      };
    }),
  };

  return (
    <>
      <h1 className="sr-only">꼬순박스 강아지 수제간식 단품</h1>
      <JsonLd data={productListJsonLd} />
      <Suspense fallback={null}>
        <PurchasePaymentErrorNotice />
      </Suspense>
      <PurchaseListSection productsByTier={productsByTier} ratingByTier={ratingByTier} />
    </>
  );
}
