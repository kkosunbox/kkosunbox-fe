"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getStoredInviteCode,
  INVITE_CODE_COOKIE,
  INVITE_CODE_MAX_AGE_SEC,
  INVITE_SLUG_COOKIE,
  getStoredInviteSlug,
} from "@/features/referral/lib";
import { validateReferralCode, getReferralPage, getMyReferralCode } from "@/features/referral/api";
import { getSubscriptions } from "@/features/subscription/api";
import { useAuth } from "@/features/auth";

interface ReferralData {
  refCode: string | null;
  isReferral: boolean;
  discountRate: number;
  influencerName: string;
  profileImageUrl: string | null;
}

interface ReferralState extends ReferralData {
  /** true = 현재 세션에서 초대코드 할인을 받을 수 있음. 모든 경로에서 isReferral && !hasSubscriptionHistory. */
  inviteEligible: boolean;
  /**
   * 구독 완료 시점에 호출 — 이후 hasSubscriptionHistory 서버 재계산(router.refresh())을
   * 기다리지 않고 즉시 inviteEligible을 false로 확정한다.
   * (구독 완료 시 초대코드 쿠키도 함께 지워지는데, layout이 쿠키 유무로 구독이력 조회 자체를
   * 스킵하는 구조라 재계산 값을 그대로 믿으면 오히려 다시 true가 될 수 있어 별도 신호가 필요함.)
   */
  markInviteConsumed: () => void;
}

export interface InitialReferralData {
  slug: string;
  refCode: string;
  discountRate: number;
  influencerName: string;
  profileImageUrl: string | null;
}

const DEFAULT_DATA: ReferralData = {
  refCode: null,
  isReferral: false,
  discountRate: 0.1,
  influencerName: "홍길동",
  profileImageUrl: null,
};

const DEFAULT_STATE: ReferralState = { ...DEFAULT_DATA, inviteEligible: false, markInviteConsumed: () => {} };

const ReferralContext = createContext<ReferralState>(DEFAULT_STATE);

export function ReferralProvider({
  children,
  initialData,
  hasSubscriptionHistory = false,
}: {
  children: React.ReactNode;
  initialData?: InitialReferralData;
  /** 서버에서 전달 — 구독 이력 존재 여부. 쿠키 기반 초대코드 할인 적격 판정에 사용 */
  hasSubscriptionHistory?: boolean;
}) {
  const [data, setData] = useState<ReferralData>(() =>
    initialData
      ? {
          refCode: initialData.refCode,
          isReferral: true,
          discountRate: initialData.discountRate,
          influencerName: initialData.influencerName,
          profileImageUrl: initialData.profileImageUrl,
        }
      : DEFAULT_DATA,
  );
  /**
   * 초대코드 쿠키가 없어 layout이 구독이력 조회 자체를 스킵한 경로(자기 링크 방문 등)에서
   * 자기 감지가 성공하면 클라이언트에서 직접 조회해 hasSubscriptionHistory prop을 보정한다.
   */
  const [selfDetectedHistory, setSelfDetectedHistory] = useState<boolean | null>(null);
  const [inviteConsumed, setInviteConsumed] = useState(false);
  const isMounted = useRef(true);
  const initialDataRef = useRef(initialData);
  const { isLoggedIn } = useAuth();

  // 초대코드 쿠키 처리 — 로그인 여부와 무관하게 항상 한 번만 실행한다.
  useEffect(() => {
    isMounted.current = true;
    const initial = initialDataRef.current;

    if (initial) {
      // /r/{slug} 랜딩 진입 시: 쿠키 저장으로 구독 흐름 전체에 코드 유지
      document.cookie = `${INVITE_CODE_COOKIE}=${encodeURIComponent(initial.refCode)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
      document.cookie = `${INVITE_SLUG_COOKIE}=${encodeURIComponent(initial.slug)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
      return () => { isMounted.current = false; };
    }

    const code = getStoredInviteCode();
    if (code) {
      const slug = getStoredInviteSlug();
      if (slug) {
        getReferralPage(slug)
          .then((pageData) => {
            if (!isMounted.current) return;
            if (pageData.isActive && pageData.referralCode === code) {
              setData({
                refCode: code,
                isReferral: true,
                discountRate: pageData.discountRate,
                influencerName: pageData.displayName,
                profileImageUrl: pageData.profileImageUrl,
              });
            }
          })
          .catch(() => {});
      } else {
        validateReferralCode(code)
          .then((apiData) => {
            if (!isMounted.current) return;
            if (apiData.isApplicable) {
              setData({
                refCode: code,
                isReferral: true,
                discountRate: apiData.discountRate,
                influencerName: DEFAULT_DATA.influencerName,
                profileImageUrl: null,
              });
            }
          })
          .catch(() => {});
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  // 본인이 인플루언서인지 자체 감지 — 초대코드 쿠키가 없고 "로그인된" 유저에 한해서만 시도한다.
  // isLoggedIn 게이팅 없이는 비로그인 방문자(사이트 트래픽 대다수)까지 매번 /v1/referral/me를
  // 호출하게 되어 거의 항상 헛수고였다.
  useEffect(() => {
    if (initialDataRef.current || getStoredInviteCode() || !isLoggedIn) return;

    let cancelled = false;
    getMyReferralCode()
      .then((myCode) => {
        if (cancelled || !myCode.slug) return;
        const mySlug = myCode.slug;
        return Promise.all([
          getReferralPage(mySlug),
          getSubscriptions().catch(() => ({ subscriptions: [] })),
        ]).then(([pageData, subs]) => {
          if (cancelled || !pageData.isActive) return;
          document.cookie = `${INVITE_CODE_COOKIE}=${encodeURIComponent(myCode.referralCode)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
          document.cookie = `${INVITE_SLUG_COOKIE}=${encodeURIComponent(mySlug)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
          setSelfDetectedHistory(subs.subscriptions.length > 0);
          setData({
            refCode: myCode.referralCode,
            isReferral: true,
            discountRate: pageData.discountRate,
            influencerName: pageData.displayName,
            profileImageUrl: pageData.profileImageUrl,
          });
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // hasSubscriptionHistory prop은 서버 컴포넌트(layout 등)가 매 렌더 다시 계산해 내려준다 —
  // router.refresh() 직후에도 여기서 매 렌더 다시 파생시켜야 최신 값이 즉시 반영된다.
  const effectiveHasSubscriptionHistory = selfDetectedHistory ?? hasSubscriptionHistory;
  const state: ReferralState = {
    ...data,
    inviteEligible: !inviteConsumed && data.isReferral && !effectiveHasSubscriptionHistory,
    markInviteConsumed: () => setInviteConsumed(true),
  };

  return (
    <ReferralContext.Provider value={state}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferral(): ReferralState {
  return useContext(ReferralContext);
}
