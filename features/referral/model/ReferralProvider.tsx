"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  INVITE_CODE_COOKIE,
  INVITE_CODE_MAX_AGE_SEC,
  INVITE_SLUG_COOKIE,
} from "@/features/referral/lib";
import type { ReferralContext } from "@/features/referral/lib/referralContext";

/**
 * 서버가 확정한 초대 상태(`resolveReferralContext`)를 클라이언트 트리에 그대로 전달한다.
 *
 * **여기서 적격 여부를 다시 계산하지 않는다.** 예전에는 이 Provider가 쿠키를 읽어 API를 호출하고
 * 자기감지까지 하면서 서버와 별개로 판정했는데, 그 결과 같은 유저에게 `/r/{slug}`와 `/subscribe`가
 * 다른 가격을 보여줬다(2026-08-12). 판정은 서버 한곳으로 모았고, 이 컴포넌트가 하는 일은
 * ① 서버 값 전달 ② 어트리뷰션 쿠키 유지 ③ 구독 완료 즉시 반영, 셋뿐이다.
 */
interface ReferralState extends ReferralContext {
  /** 표시용 인플루언서 이름 — 값이 없을 때의 대체 문자열까지 포함한 최종값 */
  influencerName: string;
  /**
   * **마케팅 화면의 유일한 표시 기준.** 계정 적격성(`inviteEligible`)은 보지 않는다 —
   * 실제 적용 가능 여부는 `/order`가 판정하고 부적격 사유까지 안내한다.
   *
   * 가격·취소선·배지 퍼센트·추가할인 칩·CTA 문구가 **전부 이 값 하나**를 읽어야 한다.
   * 컴포넌트에서 `isReferral`·`inviteEligible`을 다시 조합하면 같은 화면 안에서 상태가 갈린다.
   *
   * 상세 정의와 각 조건의 근거: `.claude/contexts/referral-pricing-architecture.md` §2
   */
  hasDisplayableReferralOffer: boolean;
  /**
   * 구독 완료 시점에 호출 — 서버 재계산(`router.refresh()`)을 기다리지 않고
   * 즉시 초대 혜택 표시를 내린다.
   *
   * **영구 제거 장치가 아니다.** 영속 제거는 초대 코드·slug 쿠키 삭제가 담당하고,
   * 이것은 쿠키를 지운 사실이 이미 렌더된 트리에 반영되기까지의 **전이 구간 가드**다
   * (쿠키가 사라지면 layout이 재계산을 스킵해 `router.refresh()`만으로는 갱신되지 않는다).
   */
  markInviteConsumed: () => void;
}

const FALLBACK_INFLUENCER_NAME = "홍길동";

const DEFAULT_STATE: ReferralState = {
  referralSource: "none",
  refCode: null,
  slug: null,
  discountRate: 0,
  influencerName: FALLBACK_INFLUENCER_NAME,
  profileImageUrl: null,
  isReferral: false,
  firstSubscriptionEligible: false,
  inviteEligible: false,
  hasDisplayableReferralOffer: false,
  markInviteConsumed: () => {},
};

const ReferralReactContext = createContext<ReferralState>(DEFAULT_STATE);

export function ReferralProvider({
  children,
  context,
}: {
  children: React.ReactNode;
  /** 서버(`resolveReferralContext`)가 확정한 값 */
  context: ReferralContext;
}) {
  const [inviteConsumed, setInviteConsumed] = useState(false);

  const { refCode, slug, isReferral, referralSource } = context;

  // 어트리뷰션 유지 — 초대 맥락으로 확인된 요청이면 코드·slug를 쿠키에 남겨
  // 이후 요청(구독 흐름 전체)에서도 서버가 같은 상태를 재구성할 수 있게 한다.
  useEffect(() => {
    // 자기감지(`own-slug`)는 **포착된 초대가 아니다.** 아무도 이 사용자를 초대하지 않았고,
    // 이 맥락은 매 요청 계정에서 다시 유도된다(`detectOwnSlug`). 쿠키로 나를 이유가 없다.
    //
    // 심으면 다음 요청에서 서버가 slug 쿠키를 읽어 출처가 `own-slug` → `slug`로 바뀌고,
    // **자기감지 차단이 렌더 한 번 만에 무력화된다** — 인플루언서가 자기 링크를 클릭한
    // 방문자와 구별되지 않게 된다.
    if (referralSource === "own-slug") return;
    if (!isReferral || !refCode || !slug) return;
    const attrs = `Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
    document.cookie = `${INVITE_CODE_COOKIE}=${encodeURIComponent(refCode)}; ${attrs}`;
    document.cookie = `${INVITE_SLUG_COOKIE}=${encodeURIComponent(slug)}; ${attrs}`;
  }, [referralSource, isReferral, refCode, slug]);

  // 구독 완료로 코드를 소비하면 쿠키가 지워진다. 그 순간 다시 심지 않도록 소비 상태를 함께 본다.
  const value = useMemo<ReferralState>(
    () => ({
      ...context,
      influencerName: context.influencerName ?? FALLBACK_INFLUENCER_NAME,
      inviteEligible: context.inviteEligible && !inviteConsumed,
      // 마케팅 표시 술어 — **여기 한 곳에서만** 계산한다.
      //   referralSource !== "none"      초대 맥락이 성립함
      //   referralSource !== "own-slug"  자동 자기감지는 초대가 아님 (사이트 전역 영구 노출 방지)
      //   discountRate > 0               표시할 요율을 확보함
      //                                  — "서버 적격"이나 "현재 적용 가능"을 뜻하지 않는다.
      //                                    `?r=CODE`가 validate 실패로 요율 0을 받는 경우를 함께 막는다.
      //                                    없으면 "첫 달 0%추가할인" 칩이 렌더된다.
      //   !inviteConsumed                같은 세션에서 방금 소비하지 않음 (전이 구간 가드)
      hasDisplayableReferralOffer:
        context.referralSource !== "none" &&
        context.referralSource !== "own-slug" &&
        context.discountRate > 0 &&
        !inviteConsumed,
      markInviteConsumed: () => setInviteConsumed(true),
    }),
    [context, inviteConsumed],
  );

  return <ReferralReactContext.Provider value={value}>{children}</ReferralReactContext.Provider>;
}

export function useReferral(): ReferralState {
  return useContext(ReferralReactContext);
}
