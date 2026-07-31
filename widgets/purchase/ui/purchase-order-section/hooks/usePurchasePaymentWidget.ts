"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { TOSS_WIDGET_CLIENT_KEY } from "@/shared/lib/payments/tossWidgetClient";
import { PURCHASE_AGREEMENT_ELEMENT_ID, PURCHASE_WIDGET_ELEMENT_ID } from "../purchaseOrderHelpers";

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

/**
 * Toss 결제위젯 로드·마운트·금액 갱신을 소유하는 단위 훅.
 *
 * ⚠️ 위젯 렌더 effect의 deps는 반드시 `[paymentWidget]`만 유지해야 한다 — `total`을
 * deps에 추가하면 수량 변경마다 위젯이 재마운트되어 결제 iframe이 중복 생성된다.
 * 금액 갱신은 별도의 `updateAmount` effect가 전담한다.
 */
export function usePurchasePaymentWidget({ total }: { total: number }) {
  const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [widgetLoadError, setWidgetLoadError] = useState<string | null>(null);
  const paymentMethodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);
  const mountedRef = useRef(true);

  const loadWidget = useCallback(async () => {
    setWidgetLoadError(null);
    const customerKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `purchase-${Date.now()}`;
    try {
      const widget = await loadPaymentWidget(TOSS_WIDGET_CLIENT_KEY, customerKey);
      if (mountedRef.current) setPaymentWidget(widget);
    } catch (err) {
      console.error("결제위젯 로드 실패:", err);
      if (mountedRef.current) {
        setWidgetLoadError("결제 UI를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  }, []);

  // 결제위젯 SDK는 페이지 진입 시 미리 로드해 둔다.
  useEffect(() => {
    mountedRef.current = true;
    void loadWidget();
    return () => {
      mountedRef.current = false;
    };
  }, [loadWidget]);

  // 위젯 로드 완료 시 결제수단/약관 UI를 렌더링한다.
  useEffect(() => {
    if (!paymentWidget) return;

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      `#${PURCHASE_WIDGET_ELEMENT_ID}`,
      { value: total },
      { variantKey: "widgetK" },
    );
    paymentWidget.renderAgreement(`#${PURCHASE_AGREEMENT_ELEMENT_ID}`, { variantKey: "AGREEMENT" });

    paymentMethodsWidget.on("ready", () => setPaymentReady(true));
    paymentMethodsWidgetRef.current = paymentMethodsWidget;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 렌더 1회만 수행, 금액 갱신은 아래 이펙트가 담당
  }, [paymentWidget]);

  // 수량 변경에 따른 결제 금액 갱신
  useEffect(() => {
    paymentMethodsWidgetRef.current?.updateAmount(total);
  }, [total]);

  const reloadWidget = useCallback(() => {
    void loadWidget();
  }, [loadWidget]);

  const updateAmount = useCallback((amount: number) => {
    return paymentMethodsWidgetRef.current?.updateAmount(amount);
  }, []);

  return {
    paymentWidget,
    paymentReady,
    widgetLoadError,
    reloadWidget,
    updateAmount,
  };
}
