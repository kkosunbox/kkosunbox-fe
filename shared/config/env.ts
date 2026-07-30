/**
 * 환경변수 타입 안전 접근.
 *
 * ⚠️ process.env[key] (동적 대괄호 접근)는 Next.js/Turbopack이 빌드 타임에
 *    값을 인라인할 수 없어 브라우저 런타임에서 undefined가 됩니다.
 *    NEXT_PUBLIC_* 변수는 반드시 리터럴 점 표기법(process.env.NEXT_PUBLIC_XXX)으로만
 *    참조해야 Next.js가 클라이언트 번들에 정적으로 삽입합니다.
 */

const _apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!_apiUrl) throw new Error("환경변수 NEXT_PUBLIC_API_URL 가 설정되지 않았습니다.");

export const env = {
  apiUrl: _apiUrl.replace(/\/$/, ""),

  // Toss Payments 자동결제(빌링) — requestBillingAuth 호출용 클라이언트 키.
  // 시크릿 키/빌링키 발급은 백엔드 전용. 미계약 키는 NOT_SUPPORTED_METHOD 에러.
  tossClientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "",

  // Toss Payments 결제위젯(SDK v1, 단건 결제) 전용 클라이언트 키 — 자동결제 키와 별도 상품이라 공유 불가.
  // (2026-07-30) 자동결제 키를 재사용했더니 "결제위젯" 상품 미활성화 계정이라
  // GET /v1/payment-widget/widget-groups/keys 가 404 나는 문제 발견 → 전용 키로 분리.
  tossPurchaseClientKey: process.env.NEXT_PUBLIC_TOSS_PURCHASE_CLIENT_KEY ?? "",

  oauth: {
    google: { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "" },
    naver:  { clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID  ?? "" },
    kakao:  { clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID  ?? "" },
  },
} as const;
