/** 숫자 → "12,900원" (ko-KR) */
export function formatKrwPrice(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
