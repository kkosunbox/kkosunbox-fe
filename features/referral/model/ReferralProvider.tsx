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
   * 구독 완료 시점에 호출 — 서버 재계산(`router.refresh()`)을 기다리지 않고
   * 즉시 `inviteEligible`을 false로 확정한다.
   */
  markInviteConsumed: () => void;
}

const FALLBACK_INFLUENCER_NAME = "홍길동";

const DEFAULT_STATE: ReferralState = {
  refCode: null,
  slug: null,
  discountRate: 0,
  influencerName: FALLBACK_INFLUENCER_NAME,
  profileImageUrl: null,
  isReferral: false,
  firstSubscriptionEligible: false,
  inviteEligible: false,
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

  const { refCode, slug, isReferral } = context;

  // 어트리뷰션 유지 — 초대 맥락으로 확인된 요청이면 코드·slug를 쿠키에 남겨
  // 이후 요청(구독 흐름 전체)에서도 서버가 같은 상태를 재구성할 수 있게 한다.
  useEffect(() => {
    if (!isReferral || !refCode || !slug) return;
    const attrs = `Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
    document.cookie = `${INVITE_CODE_COOKIE}=${encodeURIComponent(refCode)}; ${attrs}`;
    document.cookie = `${INVITE_SLUG_COOKIE}=${encodeURIComponent(slug)}; ${attrs}`;
  }, [isReferral, refCode, slug]);

  // 구독 완료로 코드를 소비하면 쿠키가 지워진다. 그 순간 다시 심지 않도록 소비 상태를 함께 본다.
  const value = useMemo<ReferralState>(
    () => ({
      ...context,
      influencerName: context.influencerName ?? FALLBACK_INFLUENCER_NAME,
      inviteEligible: context.inviteEligible && !inviteConsumed,
      markInviteConsumed: () => setInviteConsumed(true),
    }),
    [context, inviteConsumed],
  );

  return <ReferralReactContext.Provider value={value}>{children}</ReferralReactContext.Provider>;
}

export function useReferral(): ReferralState {
  return useContext(ReferralReactContext);
}
