import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShopOrderSection } from "@/widgets/shop";
import { getShopProduct } from "@/entities/product";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "주문/결제 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function ShopOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  const product = productId ? getShopProduct(productId) : undefined;

  if (!product) {
    redirect("/shop");
  }

  // 비로그인 방문자도 구매 가능 — 토큰이 없으면 fetchDeliveryAddresses가 빈 배열을 반환한다.
  const token = await getServerToken();
  const addresses = await fetchDeliveryAddresses(token);

  return <ShopOrderSection product={product} initialAddresses={addresses} />;
}
