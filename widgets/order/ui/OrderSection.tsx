"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { useAuth } from "@/features/auth";
import { TIER_BOX_IMAGES } from "@/entities/package";
import type { BillingInfo } from "@/features/billing/api/types";
import { createDeliveryAddress } from "@/features/delivery-address/api/deliveryAddressApi";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import {
  createSubscription,
  getCouponInfo,
} from "@/features/subscription/api/subscriptionApi";
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
import {
  ORDER_ACTION_CHIP_CLASS as actionChipCls,
  ORDER_INPUT_CLASS as inputCls,
} from "./order-section/orderSectionStyles";
import {
  digitsOnly,
  formatOrderPrice as formatPrice,
  formatPhoneNumber,
  isValidKoreanPhone,
} from "./order-section/orderSectionFormatters";
import {
  OrderCheckCircleIcon as CheckCircleIcon,
  QuantityMinusIcon,
  QuantityPlusIcon,
} from "./order-section/OrderSectionIcons";
import {
  Checkbox,
  CollapsiblePanel,
  FormRow,
  RadioButton,
  SectionCard,
} from "./order-section/OrderSectionFormParts";

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

export default function OrderSection({
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

  const [newAddr, setNewAddr] = useState({
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
    },
    [],
  );

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

  const leftSections = (
    <div className="flex flex-col max-md:gap-9 md:gap-4">
      <SectionCard
        title="제품 정보"
        open={openSections.product}
        onToggle={() => toggleSection("product")}
      >
        <div>
          <div className="flex w-full items-center max-sm:gap-4 sm:gap-6">
            <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] max-sm:h-[104px] max-sm:w-[112px] sm:h-[122px] sm:w-[132px] md:h-[117px] md:w-[117px] md:rounded-[16px]">
              <img
                src={TIER_BOX_IMAGES[orderPlanTheme.tier].src}
                alt={plan.name}
                width={TIER_BOX_IMAGES[orderPlanTheme.tier].width}
                height={TIER_BOX_IMAGES[orderPlanTheme.tier].height}
                decoding="async"
                className="h-full w-auto max-w-none object-cover object-center scale-105"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <span
                className="inline-flex w-fit items-center justify-center rounded-[30px] px-3 py-1 text-body-14-sb leading-[17px] text-white"
                style={{ background: orderPlanTheme.colorVar }}
              >
                {orderPlanTheme.tierLabel}
              </span>
              <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
                {plan.name}
              </span>
              <span className="text-price-16-eb text-[var(--color-surface-dark)]">
                월 요금제 {formatPrice(unitPrice)}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30 max-md:h-6 max-md:w-6 md:h-7 md:w-7 md:rounded-[5px] md:border md:border-[var(--color-border)]"
                >
                  <span className="max-md:hidden">−</span>
                  <span className="md:hidden">
                    <QuantityMinusIcon />
                  </span>
                </button>
                <span className="text-body-14-sb text-[var(--color-text)] min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  disabled={quantity >= 99}
                  className="flex items-center justify-center text-body-14-sb text-[var(--color-text)] disabled:opacity-30 max-md:h-6 max-md:w-6 md:h-7 md:w-7 md:rounded-[5px] md:border md:border-[var(--color-border)]"
                >
                  <span className="max-md:hidden">+</span>
                  <span className="md:hidden">
                    <QuantityPlusIcon />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="주문고객 / 배송지 정보"
        open={openSections.customer}
        onToggle={() => toggleSection("customer")}
      >
        {selectedAddress ? (
          /* ── 저장된 배송지 읽기 전용 뷰 ── */
          <div className="flex flex-col gap-3 pb-1">
            {/* 라벨 + 이름 | 전화번호 | 이메일 */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedAddress.nickname ? (
                <span className="text-body-13-m text-[var(--color-text)]">
                  {selectedAddress.nickname}
                </span>
              ) : null}
              <CheckCircleIcon />
              <span className="text-body-13-m text-[var(--color-text)]">{selectedAddress.receiverName}</span>
              <span className="text-body-13-m text-[var(--color-text-secondary)]">|</span>
              <span className="text-body-13-m text-[var(--color-text)]">{selectedAddress.phoneNumber}</span>
            </div>
            {/* 주소 + 배송지 변경 버튼 */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-body-13-m text-[var(--color-text)]">
                {selectedAddress.address}
                {selectedAddress.addressDetail ? ` ${selectedAddress.addressDetail}` : ""}
              </span>
              <button
                type="button"
                onClick={handleChangeAddress}
                className={actionChipCls}
              >
                배송지 변경
              </button>
            </div>
            {/* 메모 */}
            {selectedAddress.memo && (
              <span className="text-body-13-m text-[var(--color-text-secondary)]">
                {selectedAddress.memo}
              </span>
            )}
          </div>
        ) : (
          /* ── 새 배송지 입력 폼 ── */
          <div className="flex flex-col gap-4">
            {/* 받는분 / 휴대폰 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormRow label="받는분">
                <input
                  value={newAddr.receiverName}
                  onChange={(e) => setNewAddr((s) => ({ ...s, receiverName: e.target.value }))}
                  className={`${inputCls} md:max-w-[220px]`}
                  placeholder="이름"
                />
              </FormRow>
              <FormRow label="휴대폰">
                <div className="flex flex-col gap-1">
                  <input
                    value={newAddr.phoneNumber}
                    onChange={(e) => {
                      setPhoneError(null);
                      setNewAddr((s) => ({
                        ...s,
                        phoneNumber: formatPhoneNumber(digitsOnly(e.target.value)),
                      }));
                    }}
                    onBlur={() => {
                      const raw = digitsOnly(newAddr.phoneNumber);
                      if (raw && !isValidKoreanPhone(raw)) {
                        setPhoneError("올바른 전화번호 형식이 아닙니다.");
                      }
                    }}
                    className={`${inputCls} md:max-w-[220px]`}
                    placeholder="010-0000-0000"
                    inputMode="numeric"
                  />
                  {phoneError && (
                    <p className="text-body-13-m text-red-600 pl-1" role="alert">{phoneError}</p>
                  )}
                </div>
              </FormRow>
            </div>
            {/* 우편번호 + 주소찾기 */}
            <FormRow label="우편번호">
              <div className="flex items-center gap-3">
                <input
                  value={newAddr.zipCode}
                  readOnly
                  className={`${inputCls} min-w-0 cursor-default bg-[var(--color-surface-light)] md:max-w-[220px]`}
                />
                <button
                  type="button"
                  onClick={handleSearchAddress}
                  className={actionChipCls}
                >
                  주소찾기
                </button>
              </div>
            </FormRow>
            {/* 상세 주소 */}
            <FormRow label="">
              {newAddr.address ? (
                <div className="flex flex-col gap-2">
                  <input
                    readOnly
                    value={newAddr.address}
                    className={`${inputCls} cursor-default bg-[var(--color-surface-light)]`}
                    aria-label="검색된 기본 주소"
                  />
                  <input
                    value={newAddr.addressDetail}
                    onChange={(e) => setNewAddr((s) => ({ ...s, addressDetail: e.target.value }))}
                    className={inputCls}
                    placeholder="상세 주소를 입력해주세요"
                    aria-label="상세 주소"
                  />
                </div>
              ) : (
                <input
                  value={newAddr.addressDetail}
                  onChange={(e) => setNewAddr((s) => ({ ...s, addressDetail: e.target.value }))}
                  className={inputCls}
                  placeholder="상세 주소를 입력해주세요"
                />
              )}
            </FormRow>
            {/* 배송메모 */}
            <FormRow label="배송메모">
              <input
                value={newAddr.memo}
                onChange={(e) => setNewAddr((s) => ({ ...s, memo: e.target.value }))}
                className={`${inputCls} md:max-w-[220px]`}
                placeholder="배송 시 요청사항을 입력해주세요"
                maxLength={50}
              />
            </FormRow>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="결제수단 선택"
        open={openSections.payment}
        onToggle={() => toggleSection("payment")}
      >
        <div className="flex flex-col gap-4">
          {/* 결제 수단 라디오 + 카드 정보 — 같은 행 */}
          <div className="flex items-center gap-4 flex-wrap">
            {["신용카드" /* TODO: "카카오페이", "무통장입금", "계좌이체" — 추후 지원 예정 */].map((method) => (
              <RadioButton
                key={method}
                checked={paymentMethod === method}
                onChange={() => {
                  setPaymentMethod(method);
                  openPaymentPopup(method);
                }}
                label={method}
              />
            ))}
            {/* 등록된 카드 정보 표시 + 카드 변경 버튼 */}
            {paymentMethod === "신용카드" && billing && (
              <>
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="var(--color-text)" strokeWidth="1.5" />
                    <path d="M2 10H22" stroke="var(--color-text)" strokeWidth="1.5" />
                  </svg>
                  <span className="text-body-13-m text-[var(--color-text)]">
                    {billing.cardCompany} **** {billing.lastFourDigits}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <circle cx="8" cy="8" r="8" fill="var(--color-accent)" />
                    <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => openPaymentPopup(paymentMethod)}
                  className={`${actionChipCls} ml-auto`}
                >
                  카드 변경
                </button>
              </>
            )}
          </div>

          {/* 쿠폰 사용 */}
          <div className="flex flex-col gap-3 pt-4">
            <Checkbox
              checked={couponEnabled}
              onChange={() => {
                setCouponEnabled((v) => !v);
                if (couponEnabled) {
                  setCouponCodeInput("");
                  setCouponInfo(null);
                  setCouponError(null);
                }
              }}
              label="쿠폰사용"
            />
            {couponEnabled && (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-0 md:items-center md:gap-4">
                  <span className="shrink-0 pt-3 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px] md:pt-0">
                    쿠폰입력
                  </span>
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <input
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className={`${inputCls} flex-1 min-w-0`}
                      placeholder="코드 입력"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon()}
                      className={actionChipCls}
                    >
                      쿠폰적용
                    </button>
                  </div>
                  {couponInfo?.canUse ? (
                    <span className="shrink-0 text-body-13-m text-[var(--color-text-secondary)]">
                      {couponInfo.name ?? `할인쿠폰`} {couponInfo.discountRate}% -{formatPrice(couponDiscount)}
                    </span>
                  ) : null}
                </div>
                {couponError ? (
                  <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]">{couponError}</p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {inviteSectionMode !== "hidden" && (
        <SectionCard
          title="초대코드 입력"
          open={openSections.invite}
          onToggle={() => toggleSection("invite")}
        >
          {inviteSectionMode === "ineligible" ? (
            // 초대링크 진입 + 구독 이력 있음 → 입력 필드 없이 안내 문구만 노출
            <p className="text-body-13-m text-[var(--color-text-secondary)]">
              초대코드는 첫 구독 시에만 사용 가능합니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-0 md:gap-4">
                <span className="shrink-0 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px]">
                  코드입력
                </span>
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <input
                    value={inviteCodeInput}
                    onChange={(e) => {
                      validateRequestIdRef.current += 1;
                      setInviteCodeInput(e.target.value);
                      setInviteStatus("idle");
                      setInviteBlockedMsg(null);
                      setInviteDiscountRate(0);
                    }}
                    disabled={isInviteInputLocked}
                    className={`${inputCls} flex-1 min-w-0 disabled:cursor-not-allowed disabled:opacity-60`}
                    placeholder="초대코드를 입력해주세요."
                  />
                  <button
                    type="button"
                    onClick={handleApplyInviteCode}
                    disabled={isInviteInputLocked || inviteStatus === "loading"}
                    className={`${actionChipCls} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    코드적용
                  </button>
                </div>
              </div>
              {isInviteInputLocked && inviteStatus === "loading" && (
                <p className="text-body-13-m text-[var(--color-text-secondary)] max-md:pl-[82px] md:pl-[86px]">
                  초대코드 적용 확인 중…
                </p>
              )}
              {inviteStatus === "blocked" && (
                <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]">
                  {inviteBlockedMsg ?? "첫 구독 시에만 사용 가능합니다."}
                </p>
              )}
              {inviteStatus === "networkError" && (
                <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]">
                  초대코드 확인에 실패했습니다.
                </p>
              )}
              {isInviteInputLocked &&
                (inviteStatus === "blocked" || inviteStatus === "networkError") && (
                  <div className="flex flex-wrap items-center gap-3 max-md:pl-[82px] md:pl-[86px]">
                    {inviteStatus === "networkError" && (
                      <button
                        type="button"
                        onClick={handleRetryInviteValidation}
                        className="text-body-13-m text-[var(--color-accent)] underline"
                      >
                        다시 시도
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDismissStoredInviteCode}
                      className="text-body-13-m text-[var(--color-accent)] underline"
                    >
                      코드 삭제
                    </button>
                  </div>
                )}
            </div>
          )}
        </SectionCard>
      )}

      <SectionCard
        title="배송방법"
        open={openSections.date}
        onToggle={() => toggleSection("date")}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6 md:flex-wrap">
          <span className="text-body-14-sb leading-[17px] text-[var(--color-text)]">
            우체국택배
          </span>
          <span className="text-body-13-m leading-[140%] text-[var(--color-text-secondary)]">
            월~목 배송 / 오전 11시 이후 주문 시 익일 발송
          </span>
        </div>
      </SectionCard>
    </div>
  );

  const rightColumn = (
    <div className="flex flex-col max-md:gap-9 md:gap-4">
      <SectionCard
        title="결제정보"
        open={openSections.summary}
        onToggle={() => toggleSection("summary")}
      >
        <div className="flex flex-col max-md:gap-4 md:gap-8">
            <div className="flex flex-col max-md:gap-4 md:gap-4">
              <div className="flex justify-between items-center">
                <span className="text-body-13-m text-[var(--color-text)]">
                  주문상품금액{quantity > 1 ? ` ×${quantity}` : ""}
                </span>
                <span className="text-body-13-m text-[var(--color-text)]">{formatPrice(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-13-m text-[var(--color-text)]">총 할인금액</span>
                <span className="text-body-13-m text-[var(--color-text)]">
                  -{formatPrice(totalDiscount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-13-m text-[var(--color-text)]">총 배송비</span>
                <span className="text-body-13-m text-[var(--color-text)]">-0원</span>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-light)]" />

            <div className="flex justify-between items-center">
              <span className="text-body-14-b text-[var(--color-text)]">월 요금제</span>
              <span className="text-price-20-eb text-[var(--color-text)]">{formatPrice(total)}</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Checkbox checked={agreeAll} onChange={handleAgreeAll} label="모두 동의합니다." />
                <button
                  type="button"
                  onClick={() => setAgreeOpen((p) => !p)}
                  aria-expanded={agreeOpen}
                  aria-controls="order-agreements-panel"
                  className="transition-transform duration-200"
                  style={{ transform: agreeOpen ? "matrix(1,0,0,-1,0,0)" : "none" }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="var(--color-text-secondary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <CollapsiblePanel
                id="order-agreements-panel"
                open={agreeOpen}
                className="mt-3"
                innerClassName="flex flex-col gap-2.5 border-t border-[var(--color-border-light)] pt-3 pl-1"
              >
                  <Checkbox
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms((p) => !p)}
                    label="이용약관 동의 (필수)"
                  />
                  <Checkbox
                    checked={agreePrivacy}
                    onChange={() => setAgreePrivacy((p) => !p)}
                    label="개인정보 수집·이용 동의 (필수)"
                  />
                  <Checkbox
                    checked={agreeAge}
                    onChange={() => setAgreeAge((p) => !p)}
                    label="만 14세 이상 확인 (필수)"
                  />
              </CollapsiblePanel>
            </div>

            {submitError ? (
              <p className="text-body-13-m text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!agreeAll || isPending}
              onClick={handlePay}
              className="w-full h-12 rounded-[8px] bg-[var(--color-why-bg)] text-white text-body-16-sb tracking-[-0.02em] disabled:opacity-50"
            >
              {isPending ? "처리 중…" : "결제하기"}
            </button>
        </div>
      </SectionCard>

      <div className="overflow-hidden max-md:mx-[calc(50%_-_50vw)] max-md:rounded-none md:rounded-[8px]">
        <Image
          src="/images/sidebar-banner-001.png"
          alt="꼬순박스 배너 — 체크리스트 작성하러 가기"
          width={375}
          height={126}
          className="h-auto w-full"
        />
      </div>
    </div>
  );

  const priceSummaryItems = [
    { label: "주문상품금액", value: formatPrice(basePrice), emphasis: false },
    { label: "총 할인금액", value: formatPrice(totalDiscount), emphasis: false },
    { label: "총 배송비", value: "0원", emphasis: false },
    { label: "총 주문금액", value: formatPrice(total), emphasis: true },
  ] as const;

  const priceSummaryBar = (
    <div className="w-full bg-[var(--color-why-bg)]">
      <div className="mx-auto flex w-full max-w-[806px] items-center justify-between px-8 max-md:h-[81px] md:h-[58px]">
        {priceSummaryItems.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (
              <span className="shrink-0 text-subtitle-16-sb tracking-[-0.04em] text-white">
                {index === 3 ? "=" : index === 2 ? "-" : "+"}
              </span>
            )}
            <div className={item.emphasis ? "flex flex-col items-center md:flex-row md:gap-3" : "flex flex-col items-center md:flex-row md:gap-2"}>
              <span
                className={[
                  "whitespace-nowrap tracking-[-0.04em]",
                  item.emphasis
                    ? "text-body-13-m text-[var(--color-accent-orange)] md:text-subtitle-16-b"
                    : "text-body-13-m text-white md:text-subtitle-16-sb",
                ].join(" ")}
              >
                {item.label}
              </span>
              <span
                className={[
                  "whitespace-nowrap tracking-[-0.04em]",
                  item.emphasis
                    ? "text-body-14-sb text-[var(--color-accent-orange)] md:text-subtitle-20-b"
                    : "text-body-14-sb text-white md:text-subtitle-16-sb",
                ].join(" ")}
              >
                {item.value}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pt-[var(--header-offset)]">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      {priceSummaryBar}

      <div className="bg-white lg:overflow-x-auto">
        <div
          className="mx-auto max-lg:px-6 max-md:pt-6 md:py-8 lg:px-0 lg:min-w-[900px]"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <div className="max-md:hidden lg:hidden grid grid-cols-[55%_1px_1fr] gap-x-6 items-start">
            {leftSections}
            <div className="self-stretch bg-[var(--color-text-muted)]" />
            {rightColumn}
          </div>

          <div className="max-lg:hidden grid grid-cols-[1fr_1px_327px] gap-x-8 items-start">
            {leftSections}
            <div className="self-stretch bg-[var(--color-text-muted)]" />
            {rightColumn}
          </div>

          <div className="flex flex-col gap-9 md:hidden">
            {leftSections}
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
