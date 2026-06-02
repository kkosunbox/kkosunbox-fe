"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadPaymentWidget,
  type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";

// 문서용 테스트 클라이언트 키 (결제위젯 SDK v1)
const WIDGET_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

type PaymentMethodsWidget = ReturnType<
  PaymentWidgetInstance["renderPaymentMethods"]
>;

const COUPON_AMOUNT = 5_000;
const BASE_PRICE = 50_000;

export function TossPaymentTest() {
  const [open, setOpen] = useState(false);
  const [paymentWidget, setPaymentWidget] =
    useState<PaymentWidgetInstance | null>(null);

  // 결제위젯 SDK는 페이지 진입 시 미리 로드해 둔다.
  useEffect(() => {
    let mounted = true;
    // 구매자의 고유 아이디로 사용할 customerKey. 테스트 페이지에서는 세션마다 임의 생성한다.
    const customerKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `test-${Date.now()}`;
    (async () => {
      try {
        const widget = await loadPaymentWidget(WIDGET_CLIENT_KEY, customerKey);
        if (mounted) setPaymentWidget(widget);
      } catch (error) {
        console.error("결제위젯 로드 실패:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-800"
      >
        결제하기
      </button>

      {open && (
        <PaymentModal
          paymentWidget={paymentWidget}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function PaymentModal({
  paymentWidget,
  onClose,
}: {
  paymentWidget: PaymentWidgetInstance | null;
  onClose: () => void;
}) {
  const paymentMethodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);
  const [price, setPrice] = useState(BASE_PRICE);
  const [ready, setReady] = useState(false);

  // 모달이 열려 DOM이 생성된 뒤 결제 UI / 이용약관 UI를 렌더링한다.
  useEffect(() => {
    if (paymentWidget == null) return;

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: BASE_PRICE },
      { variantKey: "DEFAULT" }
    );

    paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

    paymentMethodsWidget.on("ready", () => setReady(true));
    paymentMethodsWidgetRef.current = paymentMethodsWidget;
  }, [paymentWidget]);

  // 결제 금액 변경 시 위젯 금액 업데이트
  useEffect(() => {
    paymentMethodsWidgetRef.current?.updateAmount(price);
  }, [price]);

  // 배경 스크롤 잠금 + ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handlePaymentRequest = async () => {
    if (!paymentWidget) return;
    try {
      await paymentWidget.requestPayment({
        orderId:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `order-${Date.now()}`,
        orderName: "꼬순박스 테스트 결제",
        customerName: "테스트 구매자",
        customerEmail: "test@kkosunbox.com",
        successUrl: `${window.location.origin}/test/toss/success`,
        failUrl: `${window.location.origin}/test/toss/fail`,
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">결제</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-zinc-400 transition hover:text-zinc-700"
          >
            ✕
          </button>
        </div>

        {/* 본문 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-zinc-600">결제 금액</span>
            <span className="text-xl font-bold text-zinc-900">
              {price.toLocaleString()}원
            </span>
          </div>

          <label
            htmlFor="coupon-box"
            className="mb-2 flex items-center gap-2 text-sm text-zinc-700"
          >
            <input
              id="coupon-box"
              type="checkbox"
              onChange={(event) =>
                setPrice(
                  event.target.checked
                    ? BASE_PRICE - COUPON_AMOUNT
                    : BASE_PRICE
                )
              }
            />
            <span>{COUPON_AMOUNT.toLocaleString()}원 쿠폰 적용</span>
          </label>

          {/* 결제 UI, 이용약관 UI 영역 */}
          <div id="payment-widget" />
          <div id="agreement" />

          {!ready && (
            <p className="py-4 text-center text-sm text-zinc-400">
              결제 UI를 불러오는 중…
            </p>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex gap-2 border-t border-zinc-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handlePaymentRequest}
            disabled={!ready}
            className="flex-[2] rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {price.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
