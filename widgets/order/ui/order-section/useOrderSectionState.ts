"use client";

import { useState, useTransition } from "react";
import { useAgreementState } from "./hooks/useAgreementState";
import { usePaymentState } from "./hooks/usePaymentState";
import { useStartDateState } from "./hooks/useStartDateState";
import { useSubscriptionPriceQuote } from "./hooks/useSubscriptionPriceQuote";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import type { BillingInfo } from "@/features/billing/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { createSubscription } from "@/features/subscription/api/subscriptionApi";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import { clearStoredInviteCode, clearStoredInviteSlug } from "@/features/referral/lib";
import { useReferral } from "@/features/referral/model";
import { formatDateToYMD } from "@/features/order";
import { packageThemeForPlan } from "@/entities/package";
import { trackPurchase } from "@/shared/lib/analytics";
import { isValidKoreanPhone } from "@/shared/lib/format";
export type { NewAddrState } from "@/features/delivery-address/lib";

export interface OrderSectionProps {
  plan: SubscriptionPlanDto;
  initialAddresses: DeliveryAddress[];
  initialBilling: BillingInfo | null;
  initialQuantity?: number;
}

export function useOrderSectionState({
  plan,
  initialAddresses,
  initialBilling,
  initialQuantity = 1,
}: OrderSectionProps) {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const { profile } = useProfile();
  const { markInviteConsumed } = useReferral();
  const [isPending, startTransition] = useTransition();
  const agreement = useAgreementState();
  const address = useAddressState({ initialAddresses });
  const payment = usePaymentState({ initialBilling });
  const startDate = useStartDateState();

  const [openSections, setOpenSections] = useState({
    product: true,
    startDate: true,
    customer: true,
    payment: true,
    date: true,
    summary: true,
  });

  const [quantity, setQuantity] = useState(initialQuantity);

  const [submitError, setSubmitError] = useState<string | null>(null);

  useExternalMessages({
    onAddressSelected: address.handleAddressSelected,
    onPaymentSelected: payment.handlePaymentSelected,
  });

  const unitPrice = plan.monthlyPrice;

  // 확정(canUse)된 쿠폰 코드만 quote에 실어 보낸다 — 실제 구독 생성 시 보내는 조건과 동일.
  const appliedCouponCode =
    payment.couponInfo?.canUse && payment.couponCodeInput.trim()
      ? payment.couponCodeInput.trim()
      : undefined;
  const { quote, isQuoting, quoteError } = useSubscriptionPriceQuote({
    planId: plan.id,
    quantity,
    couponCode: appliedCouponCode,
  });

  // 금액은 서버 quote(`/v1/subscriptions/price`)가 확정한 값을 그대로 쓴다. 응답이 아직 없으면
  // (초기 렌더·조회 중) 단가 × 수량으로 낙관적 표시만 하고 할인은 0으로 둔다.
  const basePrice = quote?.originalAmount ?? unitPrice * quantity;
  const couponDiscount = quote?.couponDiscountAmount ?? 0;
  const totalDiscount = couponDiscount + (quote?.referralDiscountAmount ?? 0);
  const total = quote?.amount ?? Math.max(0, basePrice - totalDiscount);

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePay() {
    setSubmitError(null);

    if (isQuoting) {
      setSubmitError("금액을 계산하는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (quoteError) {
      setSubmitError(quoteError);
      return;
    }

    // 카드 미등록 시 버튼 자체가 disabled라 정상 UI로는 여기 도달하지 않는다. 방어적 가드.
    if (!payment.billing) {
      setSubmitError("결제 수단을 먼저 등록해 주세요.");
      return;
    }

    if (!agreement.agreeAll) {
      setSubmitError("필수 약관에 동의해 주세요.");
      return;
    }

    if (startDate.startDateMode === "scheduled" && !startDate.scheduledDate) {
      setSubmitError("구독 시작일을 선택해 주세요.");
      return;
    }

    if (!address.selectedAddress) {
      const rawPhone = address.newAddr.phoneNumber.replace(/\D/g, "");
      if (
        !address.newAddr.receiverName.trim() ||
        !rawPhone ||
        !address.newAddr.zipCode.trim() ||
        !address.newAddr.address.trim()
      ) {
        setSubmitError("배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.");
        return;
      }
      if (!isValidKoreanPhone(rawPhone)) {
        address.setPhoneError("올바른 전화번호 형식이 아닙니다.");
        return;
      }
    }

    proceedSubscription();
  }

  function proceedSubscription() {
    showLoading("구독을 처리하고 있습니다...");
    startTransition(async () => {
      try {
        let deliveryAddressId = address.selectedAddressId;

        if (!address.selectedAddress) {
          deliveryAddressId = await address.createAddress();
        }

        if (deliveryAddressId === null) {
          hideLoading();
          setSubmitError("배송지를 선택하거나 입력해 주세요.");
          return;
        }

        const { subscription: newSub } = await createSubscription({
          petProfileId: profile?.id,
          deliveryAddressId,
          planId: plan.id,
          quantity,
          couponCode:
            payment.couponInfo?.canUse && payment.couponCodeInput.trim()
              ? payment.couponCodeInput.trim()
              : undefined,
          startDate:
            startDate.startDateMode === "scheduled" && startDate.scheduledDate
              ? formatDateToYMD(startDate.scheduledDate)
              : undefined,
        });

        trackPurchase({
          transaction_id: String(newSub.id),
          value: total,
          plan_tier: plan.name,
          quantity,
        });

        // 구독 생성 완료 → 소비된 초대 코드를 정리해 재적용을 방지한다.
        clearStoredInviteCode();
        clearStoredInviteSlug();
        // 쿠키가 사라지면 layout이 구독이력 재계산 자체를 스킵해 router.refresh()만으로는
        // inviteEligible이 false로 갱신되지 않는다 — 여기서 즉시 확정한다.
        markInviteConsumed();

        router.refresh();
        router.replace("/mypage/subscription?welcome=1");
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "결제 처리 중 오류가 발생했습니다.") });
      } finally {
        hideLoading();
      }
    });
  }

  const orderPlanTheme = packageThemeForPlan(plan);

  return {
    // ── section open/close ──
    openSections,
    toggleSection,

    // ── address ──
    selectedAddress: address.selectedAddress,
    newAddr: address.newAddr,
    setNewAddr: address.setNewAddr,
    phoneError: address.phoneError,
    setPhoneError: address.setPhoneError,
    handleChangeAddress: address.handleChangeAddress,
    handleSearchAddress: address.handleSearchAddress,

    // ── start date ──
    startDateMode: startDate.startDateMode,
    scheduledDate: startDate.scheduledDate,
    minScheduledDate: startDate.minScheduledDate,
    maxScheduledDate: startDate.maxScheduledDate,
    handleStartDateModeChange: startDate.handleStartDateModeChange,
    handleScheduledDateChange: startDate.handleScheduledDateChange,

    // ── payment ──
    paymentMethod: payment.paymentMethod,
    billing: payment.billing,
    couponEnabled: payment.couponEnabled,
    couponCodeInput: payment.couponCodeInput,
    setCouponCodeInput: payment.setCouponCodeInput,
    couponInfo: payment.couponInfo,
    couponError: payment.couponError,
    handleSelectPaymentMethod: payment.handleSelectPaymentMethod,
    // "카드 등록/변경"은 팝업(`/payment?mode=direct`)에서 처리한다. 현재 창을 Toss로 이동시키면
    // 입력 중이던 주문 폼이 통째로 날아가므로 인라인 리다이렉트를 쓰지 않는다.
    handleChangeCard: payment.handleChangeCard,
    handleToggleCoupon: payment.handleToggleCoupon,
    handleApplyCoupon: payment.handleApplyCoupon,

    // ── pricing ──
    unitPrice,
    quantity,
    setQuantity,
    basePrice,
    couponDiscount,
    totalDiscount,
    total,
    isQuoting,

    // ── agreement ──
    agreeOpen: agreement.agreeOpen,
    agreeTerms: agreement.agreeTerms,
    agreePrivacy: agreement.agreePrivacy,
    agreeAge: agreement.agreeAge,
    agreeAll: agreement.agreeAll,
    onToggleAgreePanel: agreement.onToggleAgreePanel,
    onToggleTerms: agreement.onToggleTerms,
    onTogglePrivacy: agreement.onTogglePrivacy,
    onToggleAge: agreement.onToggleAge,
    handleAgreeAll: agreement.handleAgreeAll,

    // ── submit (모든 그룹 교차) ──
    submitError,
    isPending,
    handlePay,

    // ── misc ──
    orderPlanTheme,
  };
}
