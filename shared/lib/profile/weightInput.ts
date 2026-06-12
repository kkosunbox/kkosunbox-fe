/** 몸무게 입력 — 숫자·소수점만 허용 */
export function sanitizeWeightInput(value: string): string {
  const numeric = value.replace(/[^\d.]/g, "");
  const [integer = "", ...fractions] = numeric.split(".");
  if (fractions.length === 0) return integer;
  return `${integer}.${fractions.join("")}`;
}
