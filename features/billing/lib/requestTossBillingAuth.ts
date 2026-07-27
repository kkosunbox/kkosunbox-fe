import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { env } from "@/shared/config/env";

/**
 * Toss 자동결제(빌링) 카드 등록창을 띄운다. (브라우저 전용)
 *
 * PC는 기본 iframe 오버레이로 등록창이 열리고, 모바일은 현재 창이 이동한다.
 * 인증 완료 시 항상 successUrl(`?authKey=...&customerKey=...`)로 전체 페이지가
 * 리다이렉트된다(iframe이어도 마찬가지). 그 값으로 서버가
 * `POST /v1/billing/register` 또는 `PUT /v1/billing/update`를 호출해 빌링키를 발급한다.
 *
 * customerKey: Toss 권장대로 무작위 UUID. 예측 가능한 값(연속 숫자·이메일 등)은
 * Toss가 안전하지 않다고 명시하므로 사용하지 않는다. successUrl로 그대로 echo 되어
 * register/update 시점과 값이 일치한다.
 */
export async function requestTossBillingAuth(params: {
  customerKey: string;
  /** 카드 변경(재발급)인 경우 기존 BillingInfo.id. successUrl에 실어 success 페이지로 전달한다. */
  billingInfoId?: number;
  customerName?: string;
  customerEmail?: string;
}): Promise<void> {
  const tossPayments = await loadTossPayments(env.tossClientKey);
  const payment = tossPayments.payment({ customerKey: params.customerKey });
  const successUrl = new URL("/payment/billing/success", window.location.origin);
  if (params.billingInfoId !== undefined) {
    successUrl.searchParams.set("billingInfoId", String(params.billingInfoId));
  }
  await payment.requestBillingAuth({
    method: "CARD",
    successUrl: successUrl.toString(),
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
