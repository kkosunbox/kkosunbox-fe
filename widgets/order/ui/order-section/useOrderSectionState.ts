"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { useAuth } from "@/features/auth";
import type { BillingInfo } from "@/features/billing/api/types";
import { createDeliveryAddress } from "@/features/delivery-address/api/deliveryAddressApi";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { createSubscription, getCouponInfo } from "@/features/subscription/api/subscriptionApi";
import type { CouponInfo, SubscriptionPlanDto } from "@/features/subscription/api/types";
import { validateReferralCode } from "@/features/referral/api";
import { clearStoredInviteCode, getStoredInviteCode } from "@/features/referral/lib";
import {
  computeOrderPricing,
  getInviteSectionMode,
  isStaleValidationRequest,
  resolveReferralValidationFailure,
  resolveReferralValidationSuccess,
  type InviteValidationOutcome,
} from "@/features/order";
import { packageThemeForPlan } from "@/entities/package";
import { digitsOnly, isValidKoreanPhone } from "./orderSectionFormatters";

export interface OrderSectionProps {
  plan: SubscriptionPlanDto;
  initialAddresses: DeliveryAddress[];
  initialBilling: BillingInfo | null;
  initialQuantity?: number;
  /** 구독 이력 존재 여부 (취소 건 포함). 초대코드 섹션 노출/잠금 분기에 사용 */
  hasSubscriptionHistory: boolean;
  /** ?ref로 캡처된 초대 코드 (쿠키, 서버에서 검증·전달). 없으면 null */
  initialInviteCode: string | null;
}

export type NewAddrState = {
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  memo: string;
};

export function useOrderSectionState({
  plan,
  initialAddresses,
  initialBilling,
  initialQuantity = 1,
  hasSubscriptionHistory,
  initialInviteCode,
}: OrderSectionProps) {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const { profile } = useProfile();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [openSections, setOpenSections] = useState({
    product: true,
    customer: true,
    payment: true,
    invite: true,
    date: true,
    summary: true,
  });

  const [addresses, setAddresses] = useState<DeliveryAddress[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    initialAddresses[0]?.id ?? null,
  );

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  // /address 새 창에서 선택한 배송지 수신
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "ADDRESS_SELECTED" && e.data.address) {
        const addr = e.data.address as DeliveryAddress;
        setAddresses((prev) => {
          const idx = prev.findIndex((a) => a.id === addr.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = addr;
            return next;
          }
          return [...prev, addr];
        });
        setSelectedAddressId(addr.id);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const [newAddr, setNewAddr] = useState<NewAddrState>({
    receiverName: "",
    phoneNumber: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    memo: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("신용카드");
  const [couponEnabled, setCouponEnabled] = useState(false);

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // 쿠키 초대코드를 사용자가 삭제한 경우 locked 재진입 방지
  const [inviteDismissed, setInviteDismissed] = useState(false);

  const inviteSectionMode = useMemo(
    () =>
      getInviteSectionMode({
        initialInviteCode,
        hasSubscriptionHistory,
        inviteDismissed,
      }),
    [initialInviteCode, hasSubscriptionHistory, inviteDismissed],
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

  function handleDismissStoredInviteCode() {
    validateRequestIdRef.current += 1;
    clearStoredInviteCode();
    setInviteDismissed(true);
    setInviteCodeInput("");
    setInviteStatus("idle");
    setInviteBlockedMsg(null);
    setInviteDiscountRate(0);
  }

  const resetInviteStateForAccount = useCallback(() => {
    validateRequestIdRef.current += 1;
    setInviteDismissed(false);
    const mode = getInviteSectionMode({
      initialInviteCode,
      hasSubscriptionHistory,
      inviteDismissed: false,
    });
    setInviteCodeInput(mode === "locked" ? (initialInviteCode ?? "") : "");
    setInviteStatus("idle");
    setInviteBlockedMsg(null);
    setInviteDiscountRate(0);
  }, [initialInviteCode, hasSubscriptionHistory]);

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

  const [agreeOpen, setAgreeOpen] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  const [quantity, setQuantity] = useState(initialQuantity);

  const [billing, setBilling] = useState<BillingInfo | null>(initialBilling);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // /payment 팝업에서 결제수단/카드 선택 결과 수신
  useEffect(() => {
    function handlePaymentMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "PAYMENT_SELECTED") {
        const { method, billing: selectedBilling } = e.data as {
          method: string;
          billing?: BillingInfo;
        };
        setPaymentMethod(method);
        if (selectedBilling) {
          setBilling(selectedBilling);
        }
      }
    }
    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, []);

  function openPaymentPopup(method: string) {
    const url = `/payment?method=${encodeURIComponent(method)}`;
    window.open(url, "paymentPopup", "width=480,height=700,scrollbars=yes");
  }

  function handleSelectPaymentMethod(method: string) {
    setPaymentMethod(method);
    openPaymentPopup(method);
  }

  const unitPrice = plan.monthlyPrice;
  // 금액·할인 계산은 순수 함수로 분리(단위 테스트 대상). 쿠폰·초대코드 모두 단가 1개에만 적용.
  const { basePrice, couponDiscount, totalDiscount, total } = useMemo(
    () =>
      computeOrderPricing({
        unitPrice,
        quantity,
        couponRatePercent: couponInfo?.canUse ? couponInfo.discountRate : null,
        inviteRate: inviteStatus === "applicable" ? inviteDiscountRate : null,
      }),
    [unitPrice, quantity, couponInfo, inviteStatus, inviteDiscountRate],
  );

  const agreeAll = agreeTerms && agreePrivacy && agreeAge;
  function handleAgreeAll() {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeAge(next);
  }

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleToggleCoupon() {
    const next = !couponEnabled;
    setCouponEnabled(next);
    if (!next) {
      setCouponCodeInput("");
      setCouponInfo(null);
      setCouponError(null);
    }
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    const code = couponCodeInput.trim();
    if (!code) {
      setCouponError("쿠폰 코드를 입력해 주세요.");
      setCouponInfo(null);
      return;
    }
    try {
      const info = await getCouponInfo({ code });
      setCouponInfo(info);
      if (!info.canUse) {
        setCouponError(info.unavailableReason ?? "사용할 수 없는 쿠폰입니다.");
      }
    } catch (err) {
      setCouponInfo(null);
      setCouponError(getErrorMessage(err, "쿠폰 확인에 실패했습니다."));
    }
  }

  function handlePay() {
    setSubmitError(null);
    if (!agreeAll) {
      setSubmitError("필수 약관에 동의해 주세요.");
      return;
    }

    if (!selectedAddress) {
      const rawPhone = digitsOnly(newAddr.phoneNumber);
      if (
        !newAddr.receiverName.trim() ||
        !rawPhone ||
        !newAddr.zipCode.trim() ||
        !newAddr.address.trim()
      ) {
        setSubmitError("배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.");
        return;
      }
      if (!isValidKoreanPhone(rawPhone)) {
        setPhoneError("올바른 전화번호 형식이 아닙니다.");
        return;
      }
    }

    if (!billing) {
      setSubmitError("결제수단을 선택해 주세요.");
      return;
    }

    proceedSubscription();
  }

  function proceedSubscription() {
    showLoading("구독을 처리하고 있습니다...");
    startTransition(async () => {
      try {
        let deliveryAddressId = selectedAddressId;

        if (!selectedAddress) {
          const created = await createDeliveryAddress({
            receiverName: newAddr.receiverName.trim(),
            phoneNumber: digitsOnly(newAddr.phoneNumber),
            zipCode: newAddr.zipCode.trim(),
            address: newAddr.address.trim(),
            addressDetail: newAddr.addressDetail.trim() || undefined,
            memo: newAddr.memo.trim() || undefined,
          });
          deliveryAddressId = created.id;
          setAddresses((prev) => [...prev, created]);
          setSelectedAddressId(created.id);
        }

        if (deliveryAddressId === null) {
          hideLoading();
          setSubmitError("배송지를 선택하거나 입력해 주세요.");
          return;
        }

        await createSubscription({
          petProfileId: profile?.id,
          deliveryAddressId,
          planId: plan.id,
          quantity,
          couponCode:
            couponInfo?.canUse && couponCodeInput.trim() ? couponCodeInput.trim() : undefined,
          // 검증을 통과(applicable)한 초대 코드만 전송한다. 서버가 첫 구독자에 한해 할인을 반영한다.
          referralCode:
            inviteStatus === "applicable" && inviteCodeInput.trim()
              ? inviteCodeInput.trim()
              : undefined,
        });

        // 구독 생성 완료 → 소비된 초대 코드를 정리해 재적용을 방지한다.
        clearStoredInviteCode();

        router.refresh();
        router.push("/mypage/subscription?welcome=1");
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "결제 처리 중 오류가 발생했습니다.") });
      } finally {
        hideLoading();
      }
    });
  }

  function handleChangeAddress() {
    const url = selectedAddressId
      ? `/address?selectedId=${selectedAddressId}`
      : "/address";
    window.open(url, "addressPopup", "width=480,height=700,scrollbars=yes");
  }

  function handleSearchAddress() {
    if (typeof window !== "undefined" && window.daum) {
      const postcode = new window.daum.Postcode({
        oncomplete(data: { zonecode: string; roadAddress: string; jibunAddress: string; addressType: string }) {
          const addr = data.addressType === "R" ? data.roadAddress : data.jibunAddress;
          setNewAddr((s) => ({ ...s, zipCode: data.zonecode, address: addr }));
        },
        width: "100%",
        height: "100%",
      }) as { embed: (el: HTMLElement) => void; open: () => void };
      postcode.open();
    }
  }

  const orderPlanTheme = packageThemeForPlan(plan);

  return {
    openSections,
    selectedAddress,
    newAddr,
    setNewAddr,
    paymentMethod,
    couponEnabled,
    couponCodeInput,
    setCouponCodeInput,
    couponInfo,
    couponError,
    couponDiscount,
    inviteSectionMode,
    isInviteInputLocked,
    inviteCodeInput,
    inviteStatus,
    inviteBlockedMsg,
    agreeOpen,
    setAgreeOpen,
    agreeTerms,
    setAgreeTerms,
    agreePrivacy,
    setAgreePrivacy,
    agreeAge,
    setAgreeAge,
    agreeAll,
    quantity,
    setQuantity,
    billing,
    submitError,
    phoneError,
    setPhoneError,
    isPending,
    unitPrice,
    basePrice,
    totalDiscount,
    total,
    orderPlanTheme,
    toggleSection,
    handleApplyCoupon,
    handlePay,
    handleChangeAddress,
    handleSearchAddress,
    handleApplyInviteCode,
    handleRetryInviteValidation,
    handleDismissStoredInviteCode,
    handleInviteCodeChange,
    handleToggleCoupon,
    handleSelectPaymentMethod,
    openPaymentPopup,
    handleAgreeAll,
  };
}
