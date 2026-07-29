import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PurchaseOrderSection } from "@/widgets/purchase";
import { PACKAGES, CURRENT_PURCHASE_TIER, getPackagePurchaseProduct } from "@/entities/package";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { fetchProducts } from "@/features/product/api/queries";
import { resolvePurchaseProduct } from "@/features/product/lib/resolvePurchaseProduct";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "주문/결제 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function PurchaseOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  // 현재는 CURRENT_PURCHASE_TIER(프리미엄)만 단품 판매 중 — 그 외 티어는 주소 조작으로도 접근 불가.
  const pkg = tier === CURRENT_PURCHASE_TIER ? PACKAGES.find((p) => p.tier === tier) : undefined;
  const purchaseProduct = pkg ? getPackagePurchaseProduct(pkg.tier) : undefined;

  if (!pkg || !purchaseProduct) {
    redirect("/purchase");
  }

  // 비로그인 방문자도 구매 가능 — 토큰이 없으면 fetchDeliveryAddresses가 빈 배열을 반환한다.
  const token = await getServerToken();
  const [addresses, products] = await Promise.all([
    fetchDeliveryAddresses(token),
    fetchProducts(token),
  ]);
  // 백엔드 상품 카탈로그가 아직 비어있을 수 있음 — 그 경우 결제 시점에 안내 후 차단(PurchaseOrderSection 참고)
  const product = resolvePurchaseProduct(products, pkg.name);

  return (
    <PurchaseOrderSection
      pkg={pkg}
      purchaseProduct={purchaseProduct}
      initialAddresses={addresses}
      productId={product?.id ?? null}
    />
  );
}
