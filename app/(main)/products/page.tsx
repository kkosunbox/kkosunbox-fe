import type { Metadata } from "next";
import { Suspense } from "react";
import {
  COMPARE_PACKAGES,
  TIER_BOX_IMAGES,
  getPackageProductPath,
  getPackagePurchaseProduct,
} from "@/entities/package";
import { fetchProducts } from "@/features/product/api/queries";
import { resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
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
  const [products, plans] = await Promise.all([fetchProducts(), fetchSubscriptionPlans()]);
  const productsByTier = resolveProductsByTier(products, plans);
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "꼬순박스 강아지 수제간식",
    url: `${SITE_URL}/products`,
    itemListElement: COMPARE_PACKAGES.map((pkg, index) => {
      const product = productsByTier[pkg.tier];
      const price = product?.price ?? getPackagePurchaseProduct(pkg.tier)!.price;
      const url = `${SITE_URL}${getPackageProductPath(pkg.tier)}`;
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product?.name ?? pkg.name,
          description: product?.description || `${pkg.name} 강아지 수제간식 패키지`,
          image: product?.imageUrl || `${SITE_URL}${TIER_BOX_IMAGES[pkg.tier].src}`,
          url,
          brand: { "@type": "Brand", name: "꼬순박스" },
          offers: product ? {
            "@type": "Offer",
            url,
            priceCurrency: "KRW",
            price,
            availability: "https://schema.org/InStock",
            shippingDetails: PRODUCT_SHIPPING_DETAILS_JSONLD,
            hasMerchantReturnPolicy: PRODUCT_RETURN_POLICY_JSONLD,
          } : undefined,
        },
      };
    }),
  };

  return (
    <>
      <h1 className="sr-only">꼬순박스 강아지 수제간식 단품몰</h1>
      <JsonLd data={data} />
      <Suspense fallback={null}><PurchasePaymentErrorNotice /></Suspense>
      <PurchaseListSection productsByTier={productsByTier} products={products} />
    </>
  );
}
