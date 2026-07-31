/**
 * ⚠️ 임시 디버그 로그 — 상품 카탈로그(entities/product 더미 → 실 API 전환) 검증용.
 * **카탈로그가 안정적으로 채워지고 더미 폴백을 걷어낼 때 이 파일과 호출부를 전부 제거한다.**
 * TODO(product-debug): 2026-07-29 추가. 제거 대상 — `git grep product-debug` 로 호출부 전체 확인 가능.
 *
 * 상품명·가격·개수 등 민감 정보가 아니라 billing-debug와 달리 항상 출력한다(환경변수 게이트 없음).
 */
import "server-only";
import type { ApiError } from "@/shared/lib/api";
import type { ConfirmProductOrderRequest, ProductDto, ProductOrderDto } from "../api/types";

const PREFIX = "[product-debug]";

function stamp(): string {
  return new Date().toISOString();
}

/** GET /v1/products 응답 — 몇 건이 내려왔는지, 이름 목록 */
export function logProductFetch(products: ProductDto[]): void {
  console.info(
    `${PREFIX} ${stamp()} GET /v1/products →`,
    JSON.stringify({ count: products.length, names: products.map((p) => p.name) }),
  );
}

/** relatedPlanId 기반 티어별 상품 매칭 결과 — 어떤 티어가 어떤 상품/근거로 매칭됐는지 */
export function logProductResolveByTier(
  resolved: Record<string, { id: number; name: string; reason: string } | null>,
): void {
  console.info(`${PREFIX} ${stamp()} resolveProductsByTier →`, JSON.stringify(resolved));
}

/** POST /v1/products/orders/confirm 요청 직전 — 무엇으로 승인 요청하는지 */
export function logConfirmRequest(body: ConfirmProductOrderRequest): void {
  console.info(`${PREFIX} ${stamp()} → POST /v1/products/orders/confirm`, JSON.stringify(body));
}

/** confirm 성공 응답 */
export function logConfirmSuccess(order: ProductOrderDto): void {
  console.info(
    `${PREFIX} ${stamp()} ✓ confirm 성공`,
    JSON.stringify({ id: order.id, productId: order.productId, status: order.status, amount: order.amount }),
  );
}

/** confirm 실패 — statusCode·code·message·traceId 원문. traceId는 백엔드 로그 대조용 */
export function logConfirmFailure(err: unknown): void {
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
