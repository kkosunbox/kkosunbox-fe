const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;

/**
 * "다음 결제일" 표시용 라벨 계산 (순수 함수).
 *
 * nextBillingDate는 결제 크론/PG 웹훅 지연 등으로 실제로는 이미 지난 날짜인 채로 남아있을 수
 * 있다(재시도 유예기간 등) — 이 경우 신뢰 못 할 특정 날짜를 사실처럼 보여주는 대신, 시간이
 * 지나도 안 틀리는 "매달 N일"(반복 결제일)로 대체한다.
 *
 * - 오늘 이후(오늘 포함) 날짜 → "YYYY.MM.DD" 그대로
 * - 오늘보다 과거인 날짜 → "매달 N일" (일자만)
 * - 날짜 자체가 없거나 형식이 깨진 경우 → "-"
 */
export function getNextBillingDateLabel(
  nextBillingDate: string | null | undefined,
  todayYMD: string,
): string {
  if (!nextBillingDate || !DATE_PATTERN.test(nextBillingDate)) return "-";

  if (nextBillingDate < todayYMD) {
    const day = Number(nextBillingDate.slice(8, 10));
    return `매달 ${day}일`;
  }

  return nextBillingDate.slice(0, 10).replace(/-/g, ".");
}
