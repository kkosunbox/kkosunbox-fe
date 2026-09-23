import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PACKAGES,
  TIER_BOX_IMAGES,
  getPackageProductPath,
  getPackagePurchaseProduct,
  getPackageTierBySlug,
} from "@/entities/package";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProducts } from "@/features/product/api/queries";
import { resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import {
  PRODUCT_RETURN_POLICY_JSONLD,
  PRODUCT_SHIPPING_DETAILS_JSONLD,
  SITE_URL,
} from "@/shared/lib/seo";
import { JsonLd } from "@/shared/ui";
import { PurchaseProductDetailPage } from "@/widgets/purchase";

type Props = { params: Promise<{ slug: string }> };

function getCatalogPackage(slug: string) {
  const tier = getPackageTierBySlug(slug);
  if (!tier) return null;
  const pkg = PACKAGES.find((item) => item.tier === tier);
  return pkg ? { tier, pkg } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = getCatalogPackage(slug);
  if (!catalog) return { title: "상품을 찾을 수 없습니다 | 꼬순박스" };
  const canonical = getPackageProductPath(catalog.tier);
  const description = `${catalog.pkg.name}를 단품으로 만나보세요. 꼬순박스 강아지 수제간식 패키지입니다.`;
  return {
    title: `${catalog.pkg.name} 단품 | 꼬순박스`,
    description,
    alternates: { canonical },
    openGraph: { title: `${catalog.pkg.name} 단품 | 꼬순박스`, description, url: canonical },
  };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = getCatalogPackage(slug);
  if (!catalog) notFound();
  const purchaseProduct = getPackagePurchaseProduct(catalog.tier);
  if (!purchaseProduct) notFound();

  const token = await getServerToken();
  const [products, plans] = await Promise.all([fetchProducts(token), fetchSubscriptionPlans(token)]);
  const product = resolveProductsByTier(products, plans)[catalog.tier];
  const url = `${SITE_URL}${getPackageProductPath(catalog.tier)}`;
  const image = product?.imageUrl || `${SITE_URL}${TIER_BOX_IMAGES[catalog.tier].src}`;
  const description = product?.description || `${catalog.pkg.name} 강아지 수제간식 패키지`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name ?? catalog.pkg.name,
    description,
    image,
    url,
    brand: { "@type": "Brand", name: "꼬순박스" },
    offers: product ? {
      "@type": "Offer",
      url,
      priceCurrency: "KRW",
      price: product.price,
      availability: product.isSalesPaused
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      shippingDetails: PRODUCT_SHIPPING_DETAILS_JSONLD,
      hasMerchantReturnPolicy: PRODUCT_RETURN_POLICY_JSONLD,
    } : undefined,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "단품몰", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: product?.name ?? catalog.pkg.name, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <PurchaseProductDetailPage
        pkg={catalog.pkg}
        purchaseProduct={{
          ...purchaseProduct,
          price: product?.price ?? purchaseProduct.price,
          originalPrice: product?.originalPrice ?? null,
        }}
        relatedPlanId={product?.relatedPlanId ?? null}
        productId={product?.id ?? null}
        isSoldOut={product?.isSoldOut ?? false}
        isSalesPaused={product?.isSalesPaused ?? true}
        imageUrl={product?.imageUrl ?? null}
      />
    </>
  );
}
