"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { PurchaseChoiceModal } from "../ui/PurchaseChoiceModal";

interface PurchaseTarget {
  /** 로그인 상태(또는 회원 구매 선택 후 로그인)에서 갈 주문서 */
  memberHref: string;
  /** 비회원 구매 선택 시 갈 비회원 주문서 */
  guestHref: string;
}

/**
 * 구매하기 진입 분기 — 로그인 상태면 바로 회원 주문서로, 아니면 비회원/회원 구매 선택 모달을 띄운다.
 * 회원 구매는 로그인 후 `memberHref`로 돌아온다.
 */
export function usePurchaseChoice() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [target, setTarget] = useState<PurchaseTarget | null>(null);

  function requestPurchase(next: PurchaseTarget) {
    if (isLoggedIn) {
      router.push(next.memberHref);
      return;
    }
    setTarget(next);
  }

  const modal = target && (
    <PurchaseChoiceModal
      onClose={() => setTarget(null)}
      onGuest={() => { setTarget(null); router.push(target.guestHref); }}
      onMember={() => { setTarget(null); router.push(`/login?next=${encodeURIComponent(target.memberHref)}`); }}
    />
  );

  return { requestPurchase, purchaseChoiceModal: modal };
}
