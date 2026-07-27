import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { env } from "@/shared/config/env";

/**
 * Toss 자동결제(빌링) 카드 등록창을 띄운다. (브라우저 전용)
 *
 * `windowTarget: "self"` — 현재 창을 Toss 등록 페이지로 이동시킨다.
 * PC 기본값인 `"iframe"`은 고정 폭 데스크탑 레이아웃이라 480px 결제 팝업 안에서
 * 좌우가 잘린다. `"self"`는 Toss가 호스팅하는 반응형 페이지로 이동하므로 창 폭에 맞춰진다.
 * (모바일은 애초에 iframe을 쓸 수 없어 self가 기본값 — 양쪽 동작이 통일된다)
 *
 * 인증 완료 시 successUrl(`?authKey=...&customerKey=...`)로 리다이렉트되고, 그 값으로
 * 서버가 `POST /v1/billing/register` 또는 `PUT /v1/billing/update`를 호출해 빌링키를 발급한다.
 * 취소·실패하면 failUrl로 이동한다(iframe처럼 오버레이만 닫히고 제자리에 남지 않는다).
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
    windowTarget: "self",
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
