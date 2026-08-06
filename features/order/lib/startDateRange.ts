/**
 * 구독 시작일(예약) 선택 가능 범위 계산 (순수 함수).
 *
 * 범위: 내일 ~ 다음 달 말일.
 * 예) 오늘이 8월 6일 → 최소 8월 7일, 최대 9월 30일.
 */

export interface StartDateRange {
  minDate: Date;
  maxDate: Date;
}

export function computeStartDateRange(today: Date): StartDateRange {
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  // 다음 달 말일 = (오늘 기준 2개월 후 1일) - 1일
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  return { minDate, maxDate };
}

/** `Date` → `YYYY-MM-DD`. 로컬 날짜 기준(타임존 변환 없음). */
export function formatDateToYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
