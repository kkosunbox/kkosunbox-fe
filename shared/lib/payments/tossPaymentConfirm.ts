import "server-only";

/**
 * ⚠️ /shop 전용 — /shop 라우트는 proxy.ts의 DISABLED_ROUTES에서 전부 "/"로 리다이렉트되어
 * 현재 아무도 접근할 수 없다(광고 집행 전 잠정 비활성화). /purchase/order/success는 더 이상 이 함수를
 * 쓰지 않고 백엔드 confirmProductOrderServer()(features/product/api/queries.ts)로 승인한다.
 * /shop이 재활성화되려면 이 domain도 백엔드 Product 카탈로그 연동이 먼저 필요 —
 * 그전까지는 여기 있는 로직을 실제 결제 참고용으로 쓰지 말 것.
 */

/**
 * 서버 전용 시크릿 키 — TOSS_PURCHASE_CLIENT_KEY(shared/lib/payments/tossWidgetClient.ts)와 짝을 이룬다.
 * 예전엔 Toss 공식 문서 공유 테스트 키(test_gsk_docs_...)가 하드코딩돼 있었음 —
 * 클라이언트키만 실 계정 키로 교체됐던 /purchase 쪽과 짝이 안 맞아 승인 실패가 났던 것과 동일한 문제.
 * .env.local에 TOSS_PURCHASE_SECRET_KEY로 설정한다(Toss 개발자센터 발급 값, 절대 커밋 금지).
 */
const TOSS_WIDGET_SECRET_KEY = process.env.TOSS_PURCHASE_SECRET_KEY ?? "";

export interface ConfirmTossPaymentParams {
  paymentKey: string;
  orderId: string;
  amount: string;
}

/**
 * Toss 결제위젯(일반/단건 결제) 승인. 시크릿 키가 필요해 서버 컴포넌트에서만 호출한다.
 * 현재 /shop/order/success 단 한 곳에서만 사용 — /purchase는 백엔드 confirm으로 이전됨(위 파일 상단 주석 참고).
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
