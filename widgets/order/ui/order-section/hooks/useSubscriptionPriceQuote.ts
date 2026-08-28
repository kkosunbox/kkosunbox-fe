"use client";

import { useEffect, useRef, useState } from "react";
import { getSubscriptionPriceQuote } from "@/features/subscription/api/subscriptionApi";
import type { QuoteSubscriptionPriceResponse } from "@/features/subscription/api/types";
import { getErrorMessage } from "@/shared/lib/api";

const QUOTE_DEBOUNCE_MS = 300;

/**
 * `POST /v1/subscriptions/price`로 결제 예정 금액을 서버에 물어 그대로 표시한다.
 * 수량·적용된 쿠폰코드·검증 통과한 초대코드가 바뀔 때마다 디바운스 후 재조회하고,
 * 응답이 오는 사이 값이 또 바뀌면 요청 ID로 stale 응답을 무시한다
 * (`useInviteState`의 재검증 가드와 동일 패턴, `usePurchasePriceQuote`와 동형).
 */
export function useSubscriptionPriceQuote({
  planId,
  quantity,
  couponCode,
  referralCode,
}: {
  planId: number;
  quantity: number;
  couponCode?: string;
  referralCode?: string;
}) {
  const [quote, setQuote] = useState<QuoteSubscriptionPriceResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    const timer = setTimeout(() => {
      setIsQuoting(true);
      getSubscriptionPriceQuote({ planId, quantity, couponCode, referralCode })
        .then((res) => {
          if (requestId !== requestIdRef.current) return;
          setQuote(res);
          setQuoteError(null);
        })
        .catch((err) => {
          if (requestId !== requestIdRef.current) return;
          setQuote(null);
          setQuoteError(getErrorMessage(err, "금액을 계산하지 못했습니다."));
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setIsQuoting(false);
        });
    }, QUOTE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [planId, quantity, couponCode, referralCode]);

  return { quote, isQuoting, quoteError };
}
