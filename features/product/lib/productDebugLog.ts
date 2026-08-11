/**
 * 상품 카탈로그(하드코딩 폴백 → 실 API 전환) 검증용 **개발 전용** 로그.
 * 카탈로그가 안정적으로 채워지고 더미 폴백을 걷어낼 때 이 파일과 호출부를 전부 제거한다.
 * 제거 대상 확인: `git grep product-debug`
 *
 * 출력 조건 — 아래 두 가지를 **모두** 만족할 때만 출력한다.
 * 1. `import "server-only"` — 서버 전용. 브라우저 콘솔·HTML·RSC 페이로드에는 실리지 않는다.
 * 2. `NODE_ENV !== "production"` — 프로덕션 빌드에서는 구조적으로 출력 불가능하다.
 *
 * ⚠️ **여기에 "로그를 켜는 환경변수"를 만들지 말 것.** 켜고 끌 수 있는 스위치는
 * 프로젝트를 이어받은 사람이 운영에서 실수로 켤 수 있다. 실제로 같은 이유로
 * `BILLING_DEBUG_LOG`(authKey 원문 노출)를 스위치째 제거했다.
 */
import "server-only";
import type { ApiError } from "@/shared/lib/api";
import type { ConfirmProductOrderRequest, ProductDto, ProductOrderDto } from "../api/types";

const PREFIX = "[product-debug]";

/** 프로덕션 빌드에서는 항상 false — 런타임 설정으로 켤 수 없다. */
function enabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

function stamp(): string {
  return new Date().toISOString();
}

/** GET /v1/products 응답 — 몇 건이 내려왔는지, 이름 목록 */
export function logProductFetch(products: ProductDto[]): void {
  if (!enabled()) return;
  console.info(
    `${PREFIX} ${stamp()} GET /v1/products →`,
    JSON.stringify({ count: products.length, names: products.map((p) => p.name) }),
  );
}

/** relatedPlanId 기반 티어별 상품 매칭 결과 — 어떤 티어가 어떤 상품/근거로 매칭됐는지 */
export function logProductResolveByTier(
  resolved: Record<string, { id: number; name: string; reason: string } | null>,
): void {
  if (!enabled()) return;
  console.info(`${PREFIX} ${stamp()} resolveProductsByTier →`, JSON.stringify(resolved));
}

/** POST /v1/products/orders/confirm 요청 직전 — 무엇으로 승인 요청하는지 */
export function logConfirmRequest(body: ConfirmProductOrderRequest): void {
  if (!enabled()) return;
  console.info(`${PREFIX} ${stamp()} → POST /v1/products/orders/confirm`, JSON.stringify(body));
}

/** confirm 성공 응답 */
export function logConfirmSuccess(order: ProductOrderDto): void {
  if (!enabled()) return;
  console.info(
    `${PREFIX} ${stamp()} ✓ confirm 성공`,
    JSON.stringify({ id: order.id, productId: order.productId, status: order.status, amount: order.amount }),
  );
}

/** confirm 실패 — statusCode·code·message·traceId 원문. traceId는 백엔드 로그 대조용 */
export function logConfirmFailure(err: unknown): void {
  if (!enabled()) return;
  const apiErr = err as Partial<ApiError> & { message?: string };
  console.error(
    `${PREFIX} ${stamp()} ✗ confirm 실패`,
    JSON.stringify({
      statusCode: apiErr?.statusCode ?? null,
      code: apiErr?.code ?? null,
      message: apiErr?.message ?? String(err),
      traceId: apiErr?.traceId ?? null,
    }),
  );
}
