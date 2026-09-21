import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseListSection, PurchasePaymentErrorNotice } from "@/widgets/purchase";
import { fetchProductCategories, fetchProducts } from "@/features/product/api/queries";
import { JsonLd } from "@/shared/ui";
import { SITE_URL, PRODUCT_SHIPPING_DETAILS_JSONLD, PRODUCT_RETURN_POLICY_JSONLD } from "@/shared/lib/seo";

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
  const [products, categories] = await Promise.all([fetchProducts(), fetchProductCategories()]);
  const productListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "꼬순박스 강아지 수제간식 단품",
    url: `${SITE_URL}/purchase`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const price = product.price;

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description:
            product.description || `${product.name} 휴먼그레이드 강아지 수제간식 단품 패키지`,
          ...(product.imageUrl ? { image: product.imageUrl } : {}),
          url: `${SITE_URL}/purchase/detail?productId=${product.id}`,
          brand: { "@type": "Brand", name: "꼬순박스" },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/purchase/detail?productId=${product.id}`,
            priceCurrency: "KRW",
            price,
            availability: "https://schema.org/InStock",
            shippingDetails: PRODUCT_SHIPPING_DETAILS_JSONLD,
            hasMerchantReturnPolicy: PRODUCT_RETURN_POLICY_JSONLD,
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
      <PurchaseListSection products={products} categories={categories} />
    </>
  );
}
