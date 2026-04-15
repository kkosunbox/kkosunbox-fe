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
  quote: string;
  contents: readonly string[];
  special: string;
  customization: string;
  hearts: number;
}

/** /subscribe·구독관리 플랜 카드 목록에 공통으로 쓰는 특징 문구 */
export const SUBSCRIBE_PLAN_CARD_FEATURES = [
  "월 정기 배송",
  "맞춤 간식 구성",
  "구독 관리는 마이페이지에서",
] as const;

export const PACKAGES: PackageData[] = [
  {
    tier: "Basic",
    id: "basic",
    colorVar: "var(--color-basic)",
    tabActiveBg: "rgba(63, 105, 0, 0.2)",
    name: "베이직 패키지 BOX",
    items: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
    quote: "가볍게 시작하는\n우리아이 간식 루틴",
    contents: ["요거트볼 1종 + 츄르 1종 +", "미역칩(꼬꼬 or 꿀꿀) + 우유껌"],
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
    quote: "건강까지 챙기는\n균형 잡힌 간식 구성",
    contents: ["요거트볼 1종 +", "미역칩(꼬꼬 or 꿀꿀) +", "소고기껌 + 우유껌 + 단호박타르트"],
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
    quote: "수제 화식까지 포함된\n특별한 식사형 박스",
    contents: ["요거트볼 2종 + 화식 2종 +", "미역칩(꼬꼬 or 꿀꿀) + 소고기껌"],
    special: "휴먼그레이드 + 최상급 단백질원",
    customization: "생애주기/건강 고민\n맞춤 설계",
    hearts: 5,
  },
];

const COMPARE_ORDER: PackageTier[] = ["Premium", "Standard", "Basic"];
export const COMPARE_PACKAGES = COMPARE_ORDER.map(
  (t) => PACKAGES.find((p) => p.tier === t)!
);

/** 뱃지 표시용 영문 라벨 */
const TIER_LABEL: Record<PackageTier, string> = {
  Basic: "Basic",
  Standard: "Standard",
  Premium: "Premium",
};

export function packageThemeForPlan(plan: SubscriptionPlanLike): {
  colorVar: string;
  tabActiveBg: string;
  tierLabel: string;
  tier: PackageTier;
} {
  const tier = tierFromSubscriptionPlan(plan);
  const pkg = PACKAGES.find((p) => p.tier === tier)!;
  return {
    colorVar: pkg.colorVar,
    tabActiveBg: pkg.tabActiveBg,
    tierLabel: TIER_LABEL[tier],
    tier,
  };
}
