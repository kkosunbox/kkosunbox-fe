/**
 * ⚠️ 임시 디버그 로그 — 상품 카탈로그(entities/product 더미 → 실 API 전환) 검증용.
 * **카탈로그가 안정적으로 채워지고 더미 폴백을 걷어낼 때 이 파일과 호출부를 전부 제거한다.**
 * TODO(product-debug): 2026-07-29 추가. 제거 대상 — `git grep product-debug` 로 호출부 전체 확인 가능.
 *
 * 상품명·가격·개수 등 민감 정보가 아니라 billing-debug와 달리 항상 출력한다(환경변수 게이트 없음).
 */
import "server-only";
import type { ProductDto } from "../api/types";

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

/** 상품명 매칭 결과 — 매칭 성공 / 카탈로그 1건뿐이라 폴백 / 매칭 실패(더미 데이터로 폴백) */
export function logProductResolve(
  packageName: string,
  products: ProductDto[],
  resolved: ProductDto | null,
): void {
  const reason =
    products.length === 0
      ? "카탈로그 0건 — 더미로 폴백"
      : resolved && resolved.name === packageName
        ? "이름 매칭 성공"
        : resolved
          ? "카탈로그 1건뿐이라 그걸로 간주"
          : "카탈로그 2건 이상인데 이름 불일치 — 더미로 폴백";
  console.info(
    `${PREFIX} ${stamp()} resolvePurchaseProduct("${packageName}") →`,
    JSON.stringify({ resolvedId: resolved?.id ?? null, resolvedName: resolved?.name ?? null, reason }),
  );
}
