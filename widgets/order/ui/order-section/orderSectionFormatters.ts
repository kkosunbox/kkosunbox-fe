export function formatOrderPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

export function formatPhoneNumber(digits: string): string {
  if (digits.startsWith("02")) {
    const d = digits.slice(0, 10);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (digits.startsWith("010")) {
    const d = digits.slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
  }
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

export function isValidKoreanPhone(digits: string): boolean {
  return /^(02\d{7,8}|01[016789]\d{7,8}|0(3[1-3]|4[1-4]|5[1-5]|6[1-4]|70)\d{7,8})$/.test(digits);
}
