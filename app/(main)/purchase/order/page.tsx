import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CartOrderSection, PurchaseOrderSection } from "@/widgets/purchase";
import { PACKAGES, getPackageProductPath, getPackagePurchaseProduct } from "@/entities/package";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { fetchProduct, fetchProducts } from "@/features/product/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "주문/결제 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function PurchaseOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; quantity?: string; cartItemIds?: string; productId?: string }>;
}) {
  const { tier, quantity: quantityStr, cartItemIds: cartItemIdsParam, productId: productIdParam } = await searchParams;
  const cartItemIds = cartItemIdsParam?.split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0) ?? [];
  // 회원 주문서 — 비회원은 별도 비회원 주문서(/purchase/guest-order)를 쓰므로 로그인 후 이 주소로 돌아오게 한다.
  const token = await getServerToken();
  if (!token) {
    const query = new URLSearchParams(
      Object.entries({ tier, quantity: quantityStr, cartItemIds: cartItemIdsParam, productId: productIdParam })
        .filter((entry): entry is [string, string] => entry[1] !== undefined),
    ).toString();
    redirect(`/login?next=${encodeURIComponent(`/purchase/order${query ? `?${query}` : ""}`)}`);
  }
  if (cartItemIds.length > 0) {
    const addresses = await fetchDeliveryAddresses(token);
    return <CartOrderSection cartItemIds={cartItemIds} initialAddresses={addresses} />;
  }
  const requestedProductId = productIdParam ? Number(productIdParam) : null;
  if (productIdParam && (!requestedProductId || !Number.isInteger(requestedProductId))) redirect("/purchase");
  const parsedQuantity = quantityStr ? Number(quantityStr) : 1;
  const initialQuantity =
    Number.isInteger(parsedQuantity) && parsedQuantity >= 1 && parsedQuantity <= 99 ? parsedQuantity : 1;

  if (requestedProductId) {
    const [product, addresses] = await Promise.all([
      fetchProduct(requestedProductId, token),
      fetchDeliveryAddresses(token),
    ]);
    if (!product || product.isSoldOut || product.isSalesPaused) redirect("/purchase");

    // 단품 주문서도 기존 주문 UI를 재사용하되, 실제 상품 ID·가격은 그대로 전달한다.
    const pkg = { ...PACKAGES[0], name: product.name };
    return <PurchaseOrderSection pkg={pkg} purchaseProduct={{ tier: pkg.tier, price: product.price, originalPrice: product.originalPrice }} initialAddresses={addresses} productId={product.id} imageUrl={product.imageUrl} relatedPlanSlug={product.category?.name ?? "단품 구매"} initialQuantity={initialQuantity} />;
  }
  const pkg = PACKAGES.find((p) => p.tier === tier);
  const purchaseProduct = pkg ? getPackagePurchaseProduct(pkg.tier) : undefined;

  if (!pkg || !purchaseProduct) {
    redirect("/products");
  }

  // 1~99 범위 외 또는 정수 아님 → 기본값 1로 폴백 (상세 페이지를 거치지 않고 직접 접근해도 안전)
  const [addresses, products, plans] = await Promise.all([
    fetchDeliveryAddresses(token),
    fetchProducts(token),
    fetchSubscriptionPlans(token),
  ]);
  // 백엔드 상품 카탈로그가 아직 비어있을 수 있음 — 그 경우 결제 시점에 안내 후 차단(PurchaseOrderSection 참고)
  const product = resolveProductsByTier(products, plans)[pkg.tier];
  if (product?.isSalesPaused) {
    redirect(getPackageProductPath(pkg.tier));
  }
  // 화면에 보이는 가격과 실제 청구 금액이 다르면 안 되므로, 매칭된 실제 상품이 있으면 가격을 그걸로 덮어쓴다.
  // (productId만 넘기고 가격은 더미로 두면 결제 직전 위젯 금액만 몰래 바뀌는 꼴이 된다 — 화면·청구 불일치)
  const effectivePurchaseProduct = { ...purchaseProduct, price: product?.price ?? purchaseProduct.price };

  return (
    <PurchaseOrderSection
      pkg={pkg}
      purchaseProduct={effectivePurchaseProduct}
      initialAddresses={addresses}
      productId={product?.id ?? null}
      imageUrl={product?.imageUrl ?? null}
      relatedPlanSlug={product?.relatedPlanSlug ?? null}
      initialQuantity={initialQuantity}
    />
  );
}
