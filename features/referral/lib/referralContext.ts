/**
 * 초대코드(레퍼럴) 상태의 형태 정의.
 *
 * 값을 **확정하는 곳은 서버 하나뿐**이다(`resolveReferralContext.ts`, server-only).
 * 이 파일은 그 결과를 클라이언트까지 들고 다니기 위한 순수 타입만 담는다 —
 * 클라이언트 컴포넌트가 server-only 모듈을 import하지 않게 하려는 분리다.
 */
/**
 * 초대 맥락이 **성립한 경로**. `resolveReferralContext`가 이미 상호배타적으로 분기하던 것을
 * 값으로 남긴 것이다.
 *
 * - `"slug"`     — `/r/{slug}` 명시 진입 또는 slug 쿠키
 * - `"code"`     — `?r=CODE` (`proxy.ts`)
 * - `"own-slug"` — 쿠키 없는 로그인 인플루언서를 서버가 자기감지한 경우
 * - `"none"`     — 맥락 없음 / 조회 실패 / 비활성 slug
 *
 * **계정 적격성 판정이 아니다.** 백엔드의 `REFERRAL_SELF_REFERRAL`과 혼동하지 말 것 —
 * 이쪽은 *컨텍스트 생성 경로*, 그쪽은 *계정 적격성 판정*으로 층위가 다르다.
 */
export type ReferralSource = "none" | "slug" | "code" | "own-slug";

export interface ReferralContext {
  /**
   * 초대 맥락이 성립한 경로. 마케팅 표시 술어가 `"own-slug"`를 제외하는 데 쓴다 —
   * 자동 자기감지는 초대가 아니므로 프로모션 대상이 아니다.
   *
   * 불변조건: `isReferral === (referralSource !== "none")`
   */
  referralSource: ReferralSource;
  /** 적용 대상 초대코드. 없으면 null */
  refCode: string | null;
  /** 초대 페이지 slug. 없으면 null */
  slug: string | null;
  /** 할인율 분수 (0.15 = 15%) */
  discountRate: number;
  influencerName: string | null;
  profileImageUrl: string | null;
  /** 초대 맥락으로 진입했는가 — 배지·문구 노출 기준 */
  isReferral: boolean;
  /**
   * 초대코드를 쓸 수 있는 계정 상태인가 (= 구독 이력 없음).
   * 초대 맥락 여부와 무관한 "계정" 조건이라, 코드가 없는 유저에게 입력칸을 열어줄지 판단할 때 쓴다.
   * 구독 이력을 확인하지 못하면 false (fail-closed).
   */
  firstSubscriptionEligible: boolean;
  /** 실제로 할인을 받을 수 있는가 — **가격 적용 기준** (`isReferral && firstSubscriptionEligible`) */
  inviteEligible: boolean;
}

/** 초대 맥락이 전혀 없는 상태 */
export const INERT_REFERRAL_CONTEXT: ReferralContext = {
  referralSource: "none",
  refCode: null,
  slug: null,
  discountRate: 0,
  influencerName: null,
  profileImageUrl: null,
  isReferral: false,
  firstSubscriptionEligible: false,
  inviteEligible: false,
};
