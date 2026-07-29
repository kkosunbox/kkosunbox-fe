import "server-only";

// 문서용 테스트 시크릿 키 — Toss 공식 문서 테스트 키. 실제 금액이 청구되지 않는다.
const TOSS_WIDGET_SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

export interface ConfirmTossPaymentParams {
  paymentKey: string;
  orderId: string;
  amount: string;
}

/**
 * Toss 결제위젯(일반/단건 결제) 승인. 시크릿 키가 필요해 서버 컴포넌트에서만 호출한다.
 * /shop/order/success, /purchase/order/success 등 단건 결제 성공 페이지가 공통으로 사용한다.
 */
export async function confirmTossPayment({ paymentKey, orderId, amount }: ConfirmTossPaymentParams) {
  const encryptedSecretKey = "Basic " + Buffer.from(TOSS_WIDGET_SECRET_KEY + ":").toString("base64");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId, amount: Number(amount), paymentKey }),
    cache: "no-store",
  });

  const body = await res.json();
  return { ok: res.ok, body };
}
