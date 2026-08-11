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

/** 평균 별점까지 필요한 경우의 플랜 구조 타입 (백엔드 `SubscriptionPlanDto`가 이 형태를 만족한다) */
export type SubscriptionPlanWithRating = SubscriptionPlanLike & { averageRating: number };

/**
 * 티어별 플랜 평균 별점 맵.
 *
 * 별점의 **유일한 출처는 백엔드 `SubscriptionPlanDto.averageRating`**이다.
 * 단품(/purchase)과 구독은 같은 박스라 리뷰가 플랜 단위로 쌓이므로, 단품 화면도 이 값을 쓴다.
 * 과거 화면마다 하드코딩 별점 상수를 따로 두다가 같은 티어에 서로 다른 값이 보이는 문제가 있었다.
 *
 * 해당 티어의 플랜이 없거나 리뷰가 없으면 0 — 표시 측에서 `> 0` 가드로 별점을 숨긴다.
 */
export function resolveAverageRatingByTier(
  plans: SubscriptionPlanWithRating[],
): Record<PackageTier, number> {
  const result: Record<PackageTier, number> = { Basic: 0, Standard: 0, Premium: 0 };
  for (const plan of plans) {
    const tier = tierFromSubscriptionPlan(plan);
    // 같은 티어에 여러 플랜이 매칭되면 첫 건 우선 — resolveProductsByTier와 동일한 규칙
    if (!result[tier]) result[tier] = plan.averageRating ?? 0;
  }
  return result;
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
    items: ["가볍게 시작하는 입문용", "기본 인기 간식 구성", "알러지 고려 선택 가능"],
    quote: "가볍게 시작하는\n우리아이 간식 루틴",
    contents: ["요거트볼 1종 + 츄르 1종 +", "꼬미칩 + 삼색우유껌"],
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
    items: ["가장 많이 선택하는 구성⭐️", "인기 간식 + 특별 간식 포함", "균형 잡힌 영양 설계"],
    quote: "건강까지 챙기는\n균형 잡힌 간식 구성",
    contents: ["요거트볼 1종 +", "꼬미칩 +", "소고기껌 + 우유껌 + 오트콕크런칩"],
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
    items: ["특별한 날을 위한 최고급 구성", "고급 재료 프리미엄 간식", "맞춤 구성 + 화식 포함"],
    quote: "수제 화식까지 포함된\n특별한 식사형 박스",
    contents: ["요거트볼 2종 + 화식 2종 +", "꼬미칩 + 오트콕크런칩"],
    special: "휴먼그레이드 + 최상급 단백질원",
    customization: "생애주기/건강 고민\n맞춤 설계",
    hearts: 5,
  },
];

/**
 * `contents`의 각 배열 원소는 의도된 줄바꿈 단위(그룹)다.
 * 그룹 내부 공백은 줄바꿈 불가 공백(NBSP)으로 바꿔 그룹이 항상 붙어 있게 하고,
 * 그룹 사이에는 일반 공백을 둬 화면 너비가 부족할 때만 그 지점에서 개행되게 한다.
 * 고정 너비 없이 반응형으로 동작한다.
 */
export function formatPackageContentsLabel(contents: readonly string[]): string {
  return contents.map((group) => group.replace(/ /g, " ")).join(" ");
}

const COMPARE_ORDER: PackageTier[] = ["Premium", "Standard", "Basic"];
export const COMPARE_PACKAGES = COMPARE_ORDER.map(
  (t) => PACKAGES.find((p) => p.tier === t)!
);

/** 뱃지·비교표 등 UI 표시용 한글 라벨 */
export const TIER_LABEL: Record<PackageTier, string> = {
  Basic: "베이직",
  Standard: "스탠다드",
  Premium: "프리미엄",
};

export function tierLabel(tier: PackageTier): string {
  return TIER_LABEL[tier];
}

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
