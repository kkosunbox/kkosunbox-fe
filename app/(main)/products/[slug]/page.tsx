import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  PACKAGES,
  TIER_BOX_IMAGES,
  getPackageProductPath,
  getPackagePurchaseProduct,
  getPackageTierBySlug,
} from "@/entities/package";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProduct, fetchProducts } from "@/features/product/api/queries";
import { getProductDetailPath } from "@/features/product/lib/productPath";
import { resolveProductTier, resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import {
  PRODUCT_RETURN_POLICY_JSONLD,
  PRODUCT_SHIPPING_DETAILS_JSONLD,
  SITE_URL,
} from "@/shared/lib/seo";
import { JsonLd } from "@/shared/ui";
import { PurchaseProductDetailPage } from "@/widgets/purchase";
import IndependentProductDetailPage from "@/widgets/purchase/ui/detail/IndependentProductDetailPage";

type Props = { params: Promise<{ slug: string }> };

function getCatalogPackage(slug: string) {
  const tier = getPackageTierBySlug(slug);
  if (!tier) return null;
  const pkg = PACKAGES.find((item) => item.tier === tier);
  return pkg ? { tier, pkg } : null;
}

/** 패키지 slug가 아니면 상품 ID 경로(`/products/{productId}`)로 본다 */
function parseProductId(slug: string): number | null {
  if (!/^[1-9]\d*$/.test(slug)) return null;
  const id = Number(slug);
  return Number.isSafeInteger(id) ? id : null;
}

// generateMetadata와 페이지가 같은 요청에서 상품·플랜을 한 번만 조회하도록 묶는다.
const getProductById = cache(async (id: number) => fetchProduct(id, await getServerToken()));
const getPlans = cache(async () => fetchSubscriptionPlans(await getServerToken()));

/** 상품 ID 경로의 상품과, 패키지 상품이면 그 티어 */
const getProductEntry = cache(async (id: number) => {
  const product = await getProductById(id);
  if (!product) return null;
  if (product.relatedPlanId == null) return { product, pkg: null };
  const tier = resolveProductTier(product, await getPlans());
  const pkg = PACKAGES.find((item) => item.tier === tier) ?? null;
  return { product, pkg };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = getCatalogPackage(slug);
  if (catalog) {
    const canonical = getPackageProductPath(catalog.tier);
    const description = `${catalog.pkg.name}를 단품으로 만나보세요. 꼬순박스 강아지 수제간식 패키지입니다.`;
    return {
      title: `${catalog.pkg.name} 단품 | 꼬순박스`,
      description,
      alternates: { canonical },
      openGraph: { title: `${catalog.pkg.name} 단품 | 꼬순박스`, description, url: canonical },
    };
  }

  const productId = parseProductId(slug);
  const entry = productId ? await getProductEntry(productId) : null;
  if (!productId || !entry) return { title: "상품을 찾을 수 없습니다 | 꼬순박스" };

  const { product, pkg } = entry;
  // 패키지 상품은 ID로 들어와도 고정 slug 경로를 대표 URL로 삼는다.
  const canonical = pkg ? getPackageProductPath(pkg.tier) : getProductDetailPath(productId);
  const title = `${product.name} | 꼬순박스`;
  const description = product.description || `${product.name} 강아지 수제간식`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = getCatalogPackage(slug);
  if (!catalog) return <ProductByIdPage slug={slug} />;
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
      { "@type": "ListItem", position: 2, name: "스토어", item: `${SITE_URL}/products` },
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
        imageUrl={product?.detailThumbnailUrl ?? product?.imageUrl ?? null}
      />
    </>
  );
}

/** `/products/{productId}` — 개별 상품, 또는 ID로 들어온 패키지 상품 */
async function ProductByIdPage({ slug }: { slug: string }) {
  const productId = parseProductId(slug);
  const entry = productId ? await getProductEntry(productId) : null;
  if (!entry) notFound();

  const { product, pkg } = entry;
  if (product.relatedPlanId == null) return <IndependentProductDetailPage product={product} />;

  const purchaseProduct = pkg ? getPackagePurchaseProduct(pkg.tier) : undefined;
  if (!pkg || !purchaseProduct) notFound();
  // 화면 가격은 실제 상품 가격으로 덮어써서 /purchase/order와 정합성을 맞춘다.
  return (
    <PurchaseProductDetailPage
      pkg={pkg}
      purchaseProduct={{
        ...purchaseProduct,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
      }}
      relatedPlanId={product.relatedPlanId}
      productId={product.id}
      isSoldOut={product.isSoldOut ?? false}
      isSalesPaused={product.isSalesPaused ?? false}
      imageUrl={product.detailThumbnailUrl ?? product.imageUrl ?? null}
    />
  );
}
