export type PackageTier = "Basic" | "Standard" | "Premium";

/** API sortOrder(1-based) → 마케팅 티어. `sortOrder`가 0이면 항상 Basic이 되므로 UI는 `tierFromSubscriptionPlan` 사용 권장 */
export function sortOrderToPackageTier(sortOrder: number): PackageTier {
  const idx = Math.min(Math.max(sortOrder - 1, 0), 2);
  const tiers: PackageTier[] = ["Basic", "Standard", "Premium"];
  return tiers[idx];
}

/** 구독 플랜 DTO에서 티어 판별 (sortOrder 미설정·0 대응) */
export type SubscriptionPlanLike = {
  id: number;
  name: string;
  sortOrder: number;
};

export function tierFromSubscriptionPlan(plan: SubscriptionPlanLike): PackageTier {
  if (plan.sortOrder >= 1 && plan.sortOrder <= 3) {
    return sortOrderToPackageTier(plan.sortOrder);
  }
  const n = plan.name ?? "";
  if (/프리미엄|premium/i.test(n)) return "Premium";
  if (/스탠다드|standard/i.test(n)) return "Standard";
  if (/베이직|basic/i.test(n)) return "Basic";
  if (plan.id === 1) return "Basic";
  if (plan.id === 2) return "Standard";
  if (plan.id === 3) return "Premium";
  return "Basic";
}

/** 목록 정렬: sortOrder 우선, 동일 시 id */
export function comparePlansForDisplayOrder(a: SubscriptionPlanLike, b: SubscriptionPlanLike): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id - b.id;
}

export interface PackageData {
  tier: PackageTier;
  id: "basic" | "standard" | "premium";
  colorVar: string;
  tabActiveBg: string;
  name: string;
  items: readonly string[];
  price: string;
  quote: string;
  contents: readonly string[];
  special: string;
  customization: string;
  hearts: number;
}

export const PACKAGES: PackageData[] = [
  {
    tier: "Basic",
    id: "basic",
    colorVar: "var(--color-basic)",
    tabActiveBg: "rgba(63, 105, 0, 0.2)",
    name: "베이직 패키지 BOX",
    items: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
    price: "15,000원",
    quote: "수제 간식이 처음이에요!",
    contents: ["건조 간식 2종", "자연 화식 1종"],
    special: "휴먼그레이드 제철 식재료",
    customization: "알러지 식재료 제외",
    hearts: 3,
  },
  {
    tier: "Standard",
    id: "standard",
    colorVar: "var(--color-plus)",
    tabActiveBg: "rgba(62, 158, 217, 0.2)",
    name: "스탠다드 패키지 BOX",
    items: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
    price: "20,000원",
    quote: "매달 알찬 간식 선물을 원해요",
    contents: ["건조 간식 3종", "자연 화식 1종", "베이커리(머핀/타르트) 1종"],
    special: "휴먼그레이드 + 슈퍼푸드 추가",
    customization: "알러지 제외 + 기호성 반영",
    hearts: 4,
  },
  {
    tier: "Premium",
    id: "premium",
    colorVar: "var(--color-accent-orange)",
    tabActiveBg: "rgba(238, 104, 26, 0.2)",
    name: "프리미엄 패키지 BOX",
    items: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
    price: "25,000원",
    quote: "고급 식단과 맞춤 관리가 필요해요",
    contents: ["건조 간식 3종", "자연 화식 2종", "프리미엄 특식(테린/황태 등) 2종"],
    special: "휴먼그레이드 + 최상급 단백질원",
    customization: "생애주기/건강 고민 맞춤 설계",
    hearts: 5,
  },
];

const COMPARE_ORDER: PackageTier[] = ["Premium", "Standard", "Basic"];
export const COMPARE_PACKAGES = COMPARE_ORDER.map(
  (t) => PACKAGES.find((p) => p.tier === t)!
);

/** 피그마·PACKAGES와 동일한 티어별 색/라벨 */
const TIER_LABEL_KO: Record<PackageTier, string> = {
  Basic: "베이직",
  Standard: "스탠다드",
  Premium: "프리미엄",
};

export function packageThemeForPlan(plan: SubscriptionPlanLike): {
  colorVar: string;
  tabActiveBg: string;
  tierLabelKo: string;
  tier: PackageTier;
} {
  const tier = tierFromSubscriptionPlan(plan);
  const pkg = PACKAGES.find((p) => p.tier === tier)!;
  return {
    colorVar: pkg.colorVar,
    tabActiveBg: pkg.tabActiveBg,
    tierLabelKo: TIER_LABEL_KO[tier],
    tier,
  };
}
