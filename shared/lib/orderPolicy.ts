"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/api";

/** GET /v1/products/order-policy — 단품 주문 정책 (로그인 불필요). 금액 판정은 판매가(`price`) 합계 기준 */
export interface OrderPolicyDto {
  /** 최소 주문 금액 */
  minimumOrderAmount: number;
  /** 무료배송 기준 금액 */
  freeShippingThreshold: number;
  /** 기본 배송비 — 실제 주문 배송비는 견적 API의 `shippingFee`를 쓴다 */
  shippingFee: number;
}

let policyPromise: Promise<OrderPolicyDto> | null = null;

/** 주문 정책은 화면마다 다시 받을 필요가 없어 한 번만 조회한다. 실패하면 다음 호출에서 다시 시도한다. */
export function loadOrderPolicy() {
  policyPromise ??= apiClient.get<OrderPolicyDto>("/v1/products/order-policy").catch((err: unknown) => {
    policyPromise = null;
    throw err;
  });
  return policyPromise;
}

/** 주문 정책 — 조회 전이거나 실패하면 null (호출부에서 상수 폴백) */
export function useOrderPolicy() {
  const [policy, setPolicy] = useState<OrderPolicyDto | null>(null);
  useEffect(() => {
    let active = true;
    void loadOrderPolicy().then((data) => { if (active) setPolicy(data); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return policy;
}
