"use client";

import { useAuth } from "@/features/auth";
import type { CartPackage } from "@/features/cart";
import { usePurchaseChoice } from "@/features/guest-order";

/** 패키지 구매하기 — 최소 주문 금액을 넘긴 주문 가능한 상품 전체로 기존 구매 흐름(회원/비회원 선택)을 탄다 */
export function usePackagePurchase(pkg: CartPackage) {
  const { isLoggedIn } = useAuth();
  const { requestPurchase, purchaseChoiceModal } = usePurchaseChoice();
  const canPurchase = pkg.progress.minimumReached && pkg.pendingProductId === null && pkg.pendingItemIds.size === 0;

  function purchase() {
    if (!canPurchase) return;
    const ids = pkg.progress.orderableIds.join(",");
    // 비회원이 회원 구매를 고르면 로그인 후 단품몰로 돌아온다 — 로그인하며 비회원 패키지가 회원 장바구니로 합쳐져 항목 ID가 바뀐다.
    requestPurchase({
      memberHref: isLoggedIn ? `/purchase/order?cartItemIds=${ids}` : "/products",
      guestHref: `/purchase/guest-order?cartItemIds=${ids}`,
    });
  }

  return { canPurchase, purchase, purchaseChoiceModal };
}
