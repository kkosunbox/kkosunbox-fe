"use client";

import type { PackageData, PackagePurchaseProduct } from "@/entities/package";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { usePurchaseOrderSection } from "./purchase-order-section/usePurchaseOrderSection";
import { PurchaseOrderSectionView } from "./purchase-order-section/PurchaseOrderSectionView";

interface PurchaseOrderSectionProps {
  pkg: PackageData;
  purchaseProduct: PackagePurchaseProduct;
  initialAddresses: DeliveryAddress[];
  /** 백엔드 상품 카탈로그에서 매칭된 실제 상품 ID. 카탈로그가 비어있으면 null — 결제 시 안내 후 차단 */
  productId: number | null;
  /** 상세 페이지에서 이어받은 초기 수량 (1~99, 기본 1) */
  initialQuantity?: number;
}

export default function PurchaseOrderSection({
  pkg,
  purchaseProduct,
  initialAddresses,
  productId,
  initialQuantity = 1,
}: PurchaseOrderSectionProps) {
  const vm = usePurchaseOrderSection({ purchaseProduct, initialAddresses, productId, initialQuantity });
  return <PurchaseOrderSectionView pkg={pkg} purchaseProduct={purchaseProduct} vm={vm} />;
}
