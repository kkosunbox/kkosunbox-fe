import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchProductCategories, fetchProducts } from "@/features/product/api/queries";
import {
  PRODUCT_RETURN_POLICY_JSONLD,
  PRODUCT_SHIPPING_DETAILS_JSONLD,
  SITE_URL,
} from "@/shared/lib/seo";
import { JsonLd } from "@/shared/ui";
import { PurchaseListSection, PurchasePaymentErrorNotice } from "@/widgets/purchase";

const title = "단품몰 | 강아지 수제간식 - 꼬순박스";
const description = "꼬순박스의 강아지 수제간식과 수제간식 박스를 단품으로 만나보세요.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/products" },
  openGraph: { title, description, url: "/products", images: ["/og-image.png"] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([fetchProducts(), fetchProductCategories()]);
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "꼬순박스 강아지 수제간식",
    url: `${SITE_URL}/products`,
    itemListElement: products.map((product, index) => {
      const url = `${SITE_URL}/purchase/detail?productId=${product.id}`;
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.description || `${product.name} 강아지 수제간식`,
          ...(product.imageUrl ? { image: product.imageUrl } : {}),
          url,
          brand: { "@type": "Brand", name: "꼬순박스" },
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "KRW",
            price: product.price,
            availability: product.isSalesPaused || product.isSoldOut
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
            shippingDetails: PRODUCT_SHIPPING_DETAILS_JSONLD,
            hasMerchantReturnPolicy: PRODUCT_RETURN_POLICY_JSONLD,
          },
        },
      };
    }),
  };

  return (
    <>
      <h1 className="sr-only">꼬순박스 강아지 수제간식 단품몰</h1>
      <JsonLd data={data} />
      <Suspense fallback={null}><PurchasePaymentErrorNotice /></Suspense>
      <PurchaseListSection products={products} categories={categories} />
    </>
  );
}
