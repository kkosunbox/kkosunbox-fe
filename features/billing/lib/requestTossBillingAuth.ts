import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { env } from "@/shared/config/env";

/**
 * Toss 자동결제(빌링) 카드 등록창을 띄운다. (브라우저 전용)
 *
 * PC는 기본 iframe 오버레이로 등록창이 열리고, 모바일은 현재 창이 이동한다.
 * 등록 성공 시 successUrl(`?authKey=...&customerKey=...`)로 리다이렉트되며,
 * 백엔드 `POST /v1/billing/register {authKey, customerKey}` 로 빌링키를 발급해야 결제가 가능하다.
 *
 * customerKey: Toss 권장대로 무작위 UUID. Toss가 successUrl로 그대로 echo 하므로
 * register 시점과 값이 일치하고, 백엔드가 빌링키와 함께 저장해 이후 청구에 재사용한다.
 */
export async function requestTossBillingAuth(params: {
  customerKey: string;
  customerName?: string;
  customerEmail?: string;
}): Promise<void> {
  const tossPayments = await loadTossPayments(env.tossClientKey);
  const payment = tossPayments.payment({ customerKey: params.customerKey });
  await payment.requestBillingAuth({
    method: "CARD",
    successUrl: `${window.location.origin}/payment/billing/success`,
    failUrl: `${window.location.origin}/payment/billing/fail`,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
  });
}

/** Toss SDK가 사용자 취소 시 던지는 에러인지 판별 */
export function isTossUserCancel(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "USER_CANCEL"
  );
}
