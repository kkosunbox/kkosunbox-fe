import { env } from "@/shared/config/env";

/**
 * 결제위젯 SDK v1(일반/단건 결제)용 클라이언트 키.
 * 자동결제(빌링)의 `NEXT_PUBLIC_TOSS_CLIENT_KEY`와는 별도 Toss 상품 — 공유하면
 * "결제위젯" 상품이 활성화 안 된 계정일 때 위젯 렌더링 자체가 404로 실패한다.
 * /purchase/order 단건 결제 주문 페이지가 사용한다.
 */
export const TOSS_WIDGET_CLIENT_KEY = env.tossPurchaseClientKey;
