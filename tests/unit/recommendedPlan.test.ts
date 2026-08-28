import { describe, expect, it } from "vitest";
import {
  FALLBACK_RECOMMENDED_TIER,
  resolveRecommendedPlanIds,
  type RecommendablePlan,
} from "@/entities/package";

function plan(overrides: Partial<RecommendablePlan> & { id: number }): RecommendablePlan {
  return {
    name: "베이직 패키지 BOX",
    sortOrder: 1,
    isRecommended: false,
    ...overrides,
  };
}

const BASIC = plan({ id: 1, name: "베이직 패키지 BOX", sortOrder: 1 });
const STANDARD = plan({ id: 2, name: "스탠다드 패키지 BOX", sortOrder: 2 });
const PREMIUM = plan({ id: 3, name: "프리미엄 패키지 BOX", sortOrder: 3 });

describe("resolveRecommendedPlanIds", () => {
  it("백엔드 추천픽이 있으면 그 플랜을 쓴다", () => {
    const plans = [BASIC, STANDARD, { ...PREMIUM, isRecommended: true }];
    expect([...resolveRecommendedPlanIds(plans)]).toEqual([PREMIUM.id]);
  });

  it("백엔드가 여러 건을 추천하면 모두 유지한다 — 폴백이 이를 덮지 않는다", () => {
    const plans = [{ ...BASIC, isRecommended: true }, STANDARD, { ...PREMIUM, isRecommended: true }];
    expect([...resolveRecommendedPlanIds(plans)].sort()).toEqual([BASIC.id, PREMIUM.id]);
  });

  it("추천픽이 하나도 없으면 Standard로 폴백한다", () => {
    expect([...resolveRecommendedPlanIds([BASIC, STANDARD, PREMIUM])]).toEqual([STANDARD.id]);
  });

  it("isRecommended 필드가 아예 없어도 Standard로 폴백한다", () => {
    const plans: RecommendablePlan[] = [
      { id: 1, name: "베이직 패키지 BOX", sortOrder: 1 },
      { id: 2, name: "스탠다드 패키지 BOX", sortOrder: 2 },
    ];
    expect([...resolveRecommendedPlanIds(plans)]).toEqual([2]);
  });

  it("sortOrder가 0이어도 이름으로 Standard를 찾아 폴백한다", () => {
    const plans = [
      plan({ id: 7, name: "베이직 패키지 BOX", sortOrder: 0 }),
      plan({ id: 8, name: "스탠다드 패키지 BOX", sortOrder: 0 }),
    ];
    expect([...resolveRecommendedPlanIds(plans)]).toEqual([8]);
  });

  it("Standard 플랜이 없으면 빈 집합 — 배지를 숨긴다", () => {
    expect([...resolveRecommendedPlanIds([BASIC, PREMIUM])]).toEqual([]);
  });

  it("플랜 목록이 비어 있으면 빈 집합", () => {
    expect([...resolveRecommendedPlanIds([])]).toEqual([]);
  });

  it("폴백 티어는 Standard다", () => {
    expect(FALLBACK_RECOMMENDED_TIER).toBe("Standard");
  });
});
