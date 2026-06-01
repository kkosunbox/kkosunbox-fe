import type { PackageTier } from "@/widgets/subscribe/plans/ui/packageData";

const DEFAULT =
  "object-cover transition-transform duration-300 group-hover:scale-105";

/** Premium 썸네일 — 오른쪽 기준 ~20% 크롭(좌·상·하 여백 제거) */
const PREMIUM =
  "object-cover object-right origin-right scale-[1.25] transition-transform duration-300 group-hover:scale-[1.31]";

export function packageSummaryImageClassName(tier: PackageTier): string {
  return tier === "Premium" ? PREMIUM : DEFAULT;
}
