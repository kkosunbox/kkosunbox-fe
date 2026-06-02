import type { PackageTier } from "@/widgets/subscribe/plans/ui/packageData";

/** 패키지 요약 카드 썸네일 (홈·구독·체크리스트 공통) */
export function packageSummaryImageClassName(_tier: PackageTier): string {
  return "object-cover transition-transform duration-300 group-hover:scale-105";
}
