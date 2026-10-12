import { permanentRedirect } from "next/navigation";
import { PACKAGES, getPackageProductPath } from "@/entities/package";
import { getProductDetailPath } from "@/features/product/lib/productPath";

type Props = { searchParams: Promise<{ tier?: string; productId?: string }> };

/** 예전 상품 상세 주소 — /products/{productId} 또는 패키지 slug 경로로 영구 이동 */
export default async function PurchaseDetailPage({ searchParams }: Props) {
  const { tier, productId } = await searchParams;
  const id = Number(productId);
  if (productId && Number.isSafeInteger(id) && id > 0) permanentRedirect(getProductDetailPath(id));
  const pkg = PACKAGES.find((item) => item.tier === tier);
  permanentRedirect(pkg ? getPackageProductPath(pkg.tier) : "/products");
}
