"use client";

import { useCartPackage, type CartDto } from "@/features/cart";
import PackageBottomSheet from "./PackageBottomSheet";
import { usePackagePurchase } from "./usePackagePurchase";

/** 상세 화면 모바일 담기 후 띄우는 내 패키지 바텀시트 — 담은 뒤에만 마운트해 상세 진입 시 장바구니를 조회하지 않는다 */
export default function PackageSheetHost({ initialCart, onMore }: { initialCart: CartDto; onMore: () => void }) {
  const pkg = useCartPackage(initialCart);
  const { canPurchase, purchase, purchaseChoiceModal } = usePackagePurchase(pkg);
  return (
    <>
      <PackageBottomSheet pkg={pkg} canPurchase={canPurchase} onPurchase={purchase} onMore={onMore} />
      {purchaseChoiceModal}
    </>
  );
}
