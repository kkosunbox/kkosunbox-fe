import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GuestOrderCheckoutSection } from "@/widgets/guest-order";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "비회원 주문/결제 | 꼬순박스",
  ...NOINDEX_METADATA,
};

function parsePositiveInt(value: string | undefined) {
  const parsed = value ? Number(value) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** 비회원 주문서 — 상세 바로구매(productId·quantity) 또는 브라우저 장바구니 선택 항목(cartItemIds) */
export default async function GuestOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; quantity?: string; cartItemIds?: string }>;
}) {
  const { productId: productIdParam, quantity: quantityParam, cartItemIds: cartItemIdsParam } = await searchParams;

  const cartItemIds = cartItemIdsParam?.split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0) ?? [];
  if (cartItemIds.length > 0) {
    return <GuestOrderCheckoutSection source={{ type: "cart", cartItemIds }} />;
  }

  const productId = parsePositiveInt(productIdParam);
  if (!productId) redirect("/purchase");
  const quantity = parsePositiveInt(quantityParam);
  const initialQuantity = quantity !== null && quantity <= 99 ? quantity : 1;
  return <GuestOrderCheckoutSection source={{ type: "product", productId, initialQuantity }} />;
}
