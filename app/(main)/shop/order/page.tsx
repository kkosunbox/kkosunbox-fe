import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShopOrderSection } from "@/widgets/shop";
import { getShopProduct } from "@/entities/product";
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

  return <ShopOrderSection product={product} />;
}
