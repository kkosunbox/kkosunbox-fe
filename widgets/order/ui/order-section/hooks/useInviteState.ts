"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { validateReferralCode } from "@/features/referral/api";
import type { ReferralContext } from "@/features/referral/lib/referralContext";
import { clearStoredInviteCode, clearStoredInviteSlug, getStoredInviteCode } from "@/features/referral/lib";
import {
  getInviteSectionMode,
  isStaleValidationRequest,
  resolveReferralValidationFailure,
  resolveReferralValidationSuccess,
  type InviteSectionMode,
  type InviteValidationOutcome,
} from "@/features/order";

export interface InviteStateResult {
  inviteSectionMode: InviteSectionMode;
  isInviteInputLocked: boolean;
  inviteCodeInput: string;
  inviteStatus: "idle" | "loading" | "applicable" | "blocked" | "networkError";
  inviteBlockedMsg: string | null;
  inviteDiscountRate: number;
  handleApplyInviteCode: () => void;
  handleRetryInviteValidation: () => void;
  handleDismissStoredInviteCode: () => void;
  handleInviteCodeChange: (value: string) => void;
}

/**
 * 초대코드 섹션 상태.
 *
 * **적격 판정을 여기서 하지 않는다** — 서버가 확정한 `ReferralContext`를 그대로 쓴다.
 * 예전에는 주문 페이지가 구독 이력을 따로 조회해 판단했고, 같은 요청에서도 플랜 화면과
 * 답이 갈려 가격이 어긋났다(2026-08-12).
 *
 * 여기서 하는 재검증(`validateReferralCode`)은 **결제 직전 확인**이지 적격 판정이 아니다.
 * 서버가 부적격이라고 한 코드를 이 훅이 되살리지 않는다.
 */
export function useInviteState({ referral }: { referral: ReferralContext }): InviteStateResult {
  const initialInviteCode = referral.refCode;
  const { user } = useAuth();
  const { profile } = useProfile();

  const [inviteDismissed, setInviteDismissed] = useState(false);

  const inviteSectionMode = useMemo(
    () =>
      getInviteSectionMode({
        hasCapturedInvite: referral.isReferral,
        canUseInviteCode: referral.firstSubscriptionEligible,
        inviteDismissed,
      }),
    [referral.isReferral, referral.firstSubscriptionEligible, inviteDismissed],
  );

  const isInviteInputLocked = inviteSectionMode === "locked";

  const [inviteCodeInput, setInviteCodeInput] = useState(
    inviteSectionMode === "locked" ? (initialInviteCode ?? "") : "",
  );

  const [inviteStatus, setInviteStatus] = useState<
    "idle" | "loading" | "applicable" | "blocked" | "networkError"
  >("idle");
  const [inviteBlockedMsg, setInviteBlockedMsg] = useState<string | null>(null);
  const [inviteDiscountRate, setInviteDiscountRate] = useState(0);
  const validateRequestIdRef = useRef(0);
  const accountKeyRef = useRef(`${user?.id ?? "anon"}-${profile?.id ?? "none"}`);

  const applyValidationOutcome = useCallback((outcome: InviteValidationOutcome) => {
    setInviteStatus(outcome.status);
    setInviteBlockedMsg(outcome.blockedMsg);
    setInviteDiscountRate(outcome.discountRate);
  }, []);

  const validateInviteCode = useCallback(
    (rawCode: string) => {
      const code = rawCode.trim();
      const requestId = ++validateRequestIdRef.current;

      setInviteBlockedMsg(null);
      setInviteDiscountRate(0);
      if (!code) {
        setInviteStatus("idle");
        return;
      }
      setInviteStatus("loading");

      validateReferralCode(code)
        .then((res) => {
          if (isStaleValidationRequest(requestId, validateRequestIdRef.current)) return;
          applyValidationOutcome(resolveReferralValidationSuccess(res));
        })
        .catch((err) => {
          if (isStaleValidationRequest(requestId, validateRequestIdRef.current)) return;
          applyValidationOutcome(resolveReferralValidationFailure(err));
        });
    },
    [applyValidationOutcome],
  );

  const resetInviteStateForAccount = useCallback(() => {
    validateRequestIdRef.current += 1;
    setInviteDismissed(false);
    const mode = getInviteSectionMode({
      hasCapturedInvite: referral.isReferral,
      canUseInviteCode: referral.firstSubscriptionEligible,
      inviteDismissed: false,
    });
    setInviteCodeInput(mode === "locked" ? (initialInviteCode ?? "") : "");
    setInviteStatus("idle");
    setInviteBlockedMsg(null);
    setInviteDiscountRate(0);
  }, [initialInviteCode, referral.isReferral, referral.firstSubscriptionEligible]);

  // locked 모드 진입 시 캡처된 코드를 자동 검증한다.
  useEffect(() => {
    if (inviteSectionMode !== "locked" || !initialInviteCode) return;

    const run = () => validateInviteCode(initialInviteCode);
    const idle = window.requestIdleCallback?.(run) ?? window.setTimeout(run, 0);
    return () => {
      validateRequestIdRef.current += 1;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
    };
  }, [inviteSectionMode, initialInviteCode, validateInviteCode]);

  // 계정(유저·프로필) 전환 시 이전 세션의 검증 결과를 초기화한다.
  useEffect(() => {
    const key = `${user?.id ?? "anon"}-${profile?.id ?? "none"}`;
    if (key === accountKeyRef.current) return;
    accountKeyRef.current = key;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetInviteStateForAccount();
  }, [user?.id, profile?.id, resetInviteStateForAccount]);

  // 다른 탭에서 구독 완료 등으로 쿠키가 삭제된 경우 stale 할인 상태를 정리한다.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      if (getStoredInviteCode()) return;
      if (!initialInviteCode) return;

      validateRequestIdRef.current += 1;
      setInviteDismissed(true);
      setInviteCodeInput("");
      setInviteStatus("idle");
      setInviteBlockedMsg(null);
      setInviteDiscountRate(0);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [initialInviteCode]);

  function handleDismissStoredInviteCode() {
    validateRequestIdRef.current += 1;
    clearStoredInviteCode();
    clearStoredInviteSlug();
    setInviteDismissed(true);
    setInviteCodeInput("");
    setInviteStatus("idle");
    setInviteBlockedMsg(null);
    setInviteDiscountRate(0);
  }

  function handleApplyInviteCode() {
    validateInviteCode(inviteCodeInput);
  }

  function handleRetryInviteValidation() {
    const code = inviteCodeInput.trim() || initialInviteCode || "";
    validateInviteCode(code);
  }

  function handleInviteCodeChange(value: string) {
    validateRequestIdRef.current += 1;
    setInviteCodeInput(value);
    setInviteStatus("idle");
    setInviteBlockedMsg(null);
    setInviteDiscountRate(0);
  }

  return {
    inviteSectionMode,
    isInviteInputLocked,
    inviteCodeInput,
    inviteStatus,
    inviteBlockedMsg,
    inviteDiscountRate,
    handleApplyInviteCode,
    handleRetryInviteValidation,
    handleDismissStoredInviteCode,
    handleInviteCodeChange,
  };
}
