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

interface ReferralState {
  refCode: string | null;
  isReferral: boolean;
  /** true = 현재 세션에서 초대코드 할인을 받을 수 있음.
   * /ref/{slug}: 항상 true. 다른 페이지: isReferral && !hasSubscriptionHistory */
  inviteEligible: boolean;
  discountRate: number;
  influencerName: string;
  profileImageUrl: string | null;
}

export interface InitialReferralData {
  slug: string;
  refCode: string;
  discountRate: number;
  influencerName: string;
  profileImageUrl: string | null;
}

const DEFAULT_STATE: ReferralState = {
  refCode: null,
  isReferral: false,
  inviteEligible: false,
  discountRate: 0.1,
  influencerName: "홍길동",
  profileImageUrl: null,
};

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
  const [state, setState] = useState<ReferralState>(() =>
    initialData
      ? {
          refCode: initialData.refCode,
          isReferral: true,
          inviteEligible: true,
          discountRate: initialData.discountRate,
          influencerName: initialData.influencerName,
          profileImageUrl: initialData.profileImageUrl,
        }
      : DEFAULT_STATE,
  );
  const isMounted = useRef(true);
  const initialDataRef = useRef(initialData);
  const hasSubscriptionHistoryRef = useRef(hasSubscriptionHistory);

  useEffect(() => {
    isMounted.current = true;
    const data = initialDataRef.current;

    if (data) {
      // /ref/{slug} 랜딩 진입 시: 쿠키 저장으로 구독 흐름 전체에 코드 유지
      document.cookie = `${INVITE_CODE_COOKIE}=${encodeURIComponent(data.refCode)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
      document.cookie = `${INVITE_SLUG_COOKIE}=${encodeURIComponent(data.slug)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
      return () => { isMounted.current = false; };
    }

    const code = getStoredInviteCode();
    if (!code) {
      // 쿠키 없음 — 로그인된 인플루언서인지 확인
      getMyReferralCode()
        .then((myCode) => {
          if (!isMounted.current || !myCode.slug) return;
          const mySlug = myCode.slug;
          return getReferralPage(mySlug).then((pageData) => {
            if (!isMounted.current || !pageData.isActive) return;
            document.cookie = `${INVITE_CODE_COOKIE}=${encodeURIComponent(myCode.referralCode)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
            document.cookie = `${INVITE_SLUG_COOKIE}=${encodeURIComponent(mySlug)}; Max-Age=${INVITE_CODE_MAX_AGE_SEC}; path=/; SameSite=Lax`;
            setState({
              refCode: myCode.referralCode,
              isReferral: true,
              inviteEligible: !hasSubscriptionHistoryRef.current,
              discountRate: pageData.discountRate,
              influencerName: pageData.displayName,
              profileImageUrl: pageData.profileImageUrl,
            });
          });
        })
        .catch(() => {});
      return () => { isMounted.current = false; };
    }

    const slug = getStoredInviteSlug();
    if (slug) {
      getReferralPage(slug)
        .then((pageData) => {
          if (!isMounted.current) return;
          if (pageData.isActive && pageData.referralCode === code) {
            setState({
              refCode: code,
              isReferral: true,
              inviteEligible: !hasSubscriptionHistoryRef.current,
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
            setState({
              refCode: code,
              isReferral: true,
              inviteEligible: !hasSubscriptionHistoryRef.current,
              discountRate: apiData.discountRate,
              influencerName: DEFAULT_STATE.influencerName,
              profileImageUrl: null,
            });
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <ReferralContext.Provider value={state}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferral(): ReferralState {
  return useContext(ReferralContext);
}
