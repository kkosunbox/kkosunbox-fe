"use client";

import { useEffect, useRef, useState } from "react";
import { getProductPriceQuote } from "@/features/product/api/productApi";
import type { QuoteProductPriceResponse } from "@/features/product/api/types";
import { getErrorMessage } from "@/shared/lib/api";

const QUOTE_DEBOUNCE_MS = 300;

/**
 * `POST /v1/products/{id}/price`로 결제 예정 금액을 서버에 물어 그대로 표시한다.
 * 수량·적용된 쿠폰코드가 바뀔 때마다 디바운스 후 재조회하고, 응답이 오는 사이 값이 또 바뀌면
 * 요청 ID로 stale 응답을 무시한다(`useInviteState`의 재검증 가드와 동일 패턴).
 */
export function usePurchasePriceQuote({
  productId,
  quantity,
  couponCode,
}: {
  productId: number | null;
  quantity: number;
  couponCode?: string;
}) {
  const [quote, setQuote] = useState<QuoteProductPriceResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (productId === null) return;
    const requestId = ++requestIdRef.current;

    const timer = setTimeout(() => {
      setIsQuoting(true);
      getProductPriceQuote(productId, { quantity, couponCode })
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
  }, [productId, quantity, couponCode]);

  return { quote, isQuoting, quoteError };
}
