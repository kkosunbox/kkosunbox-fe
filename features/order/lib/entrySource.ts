/**
 * 구독 주문 페이지(/order) 진입 출처 구분용 쿼리 파라미터.
 * 단건 구매 관리의 구독 유도 배너를 통해 진입한 경우에만 "구독 시작일" 필드를 노출한다.
 */
export const ORDER_ENTRY_FROM_PARAM = "from" as const;
export const ORDER_ENTRY_FROM_PURCHASE_PROMO = "purchase" as const;
