/**
 * ⚠️ 임시 디버그 로그 — dev 실연동 검증용. **검증이 끝나면 이 파일과 호출부를 전부 제거한다.**
 * TODO(billing-debug): 2026-07-27 추가. 제거 대상 — `git grep billing-debug` 로 호출부 전체 확인 가능.
 *
 * 규칙
 * - `import "server-only"` 로 서버 전용. 브라우저 콘솔·HTML·RSC 페이로드에는 절대 실리지 않는다.
 *   (개발자도구에 authKey·customerKey를 노출하지 않으려고 서버로 옮긴 구조를 그대로 유지한다)
 * - 환경변수 `BILLING_DEBUG_LOG=1` 일 때만 출력. 값이 없으면 완전히 무음이다.
 * - authKey·customerKey **원문**이 로그에 남는다 → 운영(live) 환경에서는 절대 켜지 않는다.
 */
import "server-only";
import type { ApiError } from "@/shared/lib/api";
import type { BillingInfo } from "../api/types";

const PREFIX = "[billing-debug]";

type BillingCallKind = "register" | "update";

function enabled(): boolean {
  return process.env.BILLING_DEBUG_LOG === "1";
}

function stamp(): string {
  return new Date().toISOString();
}

/** 백엔드 호출 직전 — 어떤 값으로 요청하는지 */
export function logBillingRequest(
  kind: BillingCallKind,
  body: { authKey: string; customerKey: string; billingInfoId?: number },
): void {
  if (!enabled()) return;
  console.info(
    `${PREFIX} ${stamp()} → ${kind === "register" ? "POST /v1/billing/register" : "PUT /v1/billing/update"}`,
    JSON.stringify({
      authKey: body.authKey,
      customerKey: body.customerKey,
      billingInfoId: body.billingInfoId ?? null,
    }),
  );
}

/** 백엔드 성공 응답 — cardCompany/lastFourDigits가 null로 오는지 여기서 확인한다 */
export function logBillingSuccess(kind: BillingCallKind, billing: BillingInfo): void {
  if (!enabled()) return;
  console.info(
    `${PREFIX} ${stamp()} ✓ ${kind} 성공`,
    JSON.stringify({
      id: billing.id,
      cardCompany: billing.cardCompany,
      lastFourDigits: billing.lastFourDigits,
      cardType: billing.cardType,
      ownerType: billing.ownerType,
      isActive: billing.isActive,
      nullFields: Object.entries(billing)
        .filter(([, v]) => v === null || v === undefined)
        .map(([k]) => k),
    }),
  );
}

/** 백엔드 실패 응답 — statusCode·code·message 원문 */
export function logBillingFailure(kind: BillingCallKind, err: unknown): void {
  if (!enabled()) return;
  const apiErr = err as Partial<ApiError> & { message?: string };
  console.error(
    `${PREFIX} ${stamp()} ✗ ${kind} 실패`,
    JSON.stringify({
      statusCode: apiErr?.statusCode ?? null,
      code: apiErr?.code ?? null,
      message: apiErr?.message ?? String(err),
    }),
  );
}

/** 백엔드까지 못 간 케이스(토큰 없음·파라미터 누락 등) 기록용 */
export function logBillingNote(note: string, data?: Record<string, unknown>): void {
  if (!enabled()) return;
  console.warn(`${PREFIX} ${stamp()} ! ${note}`, data ? JSON.stringify(data) : "");
}
