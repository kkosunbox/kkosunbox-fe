"use client";

import { useMemo, useState, useTransition } from "react";
import { useAgreementState } from "./hooks/useAgreementState";
import { useInviteState } from "./hooks/useInviteState";
import { usePaymentState } from "./hooks/usePaymentState";
import { useStartDateState } from "./hooks/useStartDateState";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import type { BillingInfo } from "@/features/billing/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { createSubscription } from "@/features/subscription/api/subscriptionApi";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import { resolveSubscriptionCouponDiscount } from "@/features/subscription/lib/couponDiscount";
import { clearStoredInviteCode, clearStoredInviteSlug } from "@/features/referral/lib";
import type { ReferralContext } from "@/features/referral/lib/referralContext";
import { referralDiscountAmount } from "@/features/referral/lib/referralPricing";
import { useReferral } from "@/features/referral/model";
import { computeOrderPricing, formatDateToYMD } from "@/features/order";
import { packageThemeForPlan } from "@/entities/package";
import { trackPurchase } from "@/shared/lib/analytics";
import { isValidKoreanPhone } from "@/shared/lib/format";
export type { NewAddrState } from "@/features/delivery-address/lib";

export interface OrderSectionProps {
  plan: SubscriptionPlanDto;
  initialAddresses: DeliveryAddress[];
  initialBilling: BillingInfo | null;
  initialQuantity?: number;
  /**
   * 서버가 확정한 초대 상태(`resolveReferralContext`). 초대코드 섹션 분기와
   * **쿠폰 적용 전 단가**가 모두 이 값에서 나온다 — 플랜 선택 화면과 같은 소스라 값이 어긋나지 않는다.
   */
  referral: ReferralContext;
  /** 단건 구매 관리의 구독 유도 배너를 통해 진입한 경우에만 true — "구독 시작일" 필드 노출 */
  showStartDateOption?: boolean;
}

export function useOrderSectionState({
  plan,
  initialAddresses,
  initialBilling,
  initialQuantity = 1,
  referral,
  showStartDateOption = false,
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
  const invite = useInviteState({ referral });
  const startDate = useStartDateState();

  const [openSections, setOpenSections] = useState({
    product: true,
    startDate: true,
    customer: true,
    payment: true,
    invite: true,
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

  /**
   * 초대코드 할인 적용 상태 — 두 경로를 모두 받는다.
   *
   * 1. **캡처된 코드**(초대 링크 진입): 서버가 확정한 `referral.inviteEligible`을 따른다.
   *    플랜 선택 화면이 쓰는 값과 같은 소스이므로 쿠폰 적용 전 단가가 어긋나지 않는다.
   *    결제 직전 재검증이 `blocked`를 주면 그때만 내린다.
   * 2. **직접 입력**(open 모드): 서버 컨텍스트에는 코드가 없으므로 재검증 결과가 유일한 근거다.
   *    `applicable`이면 그 요율로 적용한다.
   */
  const referralDiscount = useMemo(() => {
    const manuallyApplied = invite.inviteStatus === "applicable";
    return {
      inviteEligible:
        manuallyApplied || (referral.inviteEligible && invite.inviteStatus !== "blocked"),
      discountRate: manuallyApplied ? invite.inviteDiscountRate : referral.discountRate,
    };
  }, [referral.inviteEligible, referral.discountRate, invite.inviteStatus, invite.inviteDiscountRate]);

  // 금액·할인 계산은 순수 함수로 분리(단위 테스트 대상). 쿠폰·초대코드 모두 단가 1개에만 적용.
  // 쿠폰 할인액은 구독 전용 resolver가 정률/정액을 판단해 산출한다(단건 쿠폰과 규칙이 다름).
  const { basePrice, couponDiscount, totalDiscount, total } = useMemo(
    () =>
      computeOrderPricing({
        unitPrice,
        quantity,
        couponDiscount: resolveSubscriptionCouponDiscount(payment.couponInfo, unitPrice),
        inviteDiscount: referralDiscountAmount(unitPrice, referralDiscount),
      }),
    [unitPrice, quantity, payment.couponInfo, referralDiscount],
  );

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePay() {
    setSubmitError(null);

    // 카드 미등록 시 버튼 자체가 disabled라 정상 UI로는 여기 도달하지 않는다. 방어적 가드.
    if (!payment.billing) {
      setSubmitError("결제 수단을 먼저 등록해 주세요.");
      return;
    }

    if (!agreement.agreeAll) {
      setSubmitError("필수 약관에 동의해 주세요.");
      return;
    }

    if (showStartDateOption && startDate.startDateMode === "scheduled" && !startDate.scheduledDate) {
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
          // 검증을 통과(applicable)한 초대 코드만 전송한다. 서버가 첫 구독자에 한해 할인을 반영한다.
          referralCode:
            invite.inviteStatus === "applicable" && invite.inviteCodeInput.trim()
              ? invite.inviteCodeInput.trim()
              : undefined,
          startDate:
            showStartDateOption && startDate.startDateMode === "scheduled" && startDate.scheduledDate
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
    showStartDateOption,
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

    // ── invite ──
    inviteSectionMode: invite.inviteSectionMode,
    isInviteInputLocked: invite.isInviteInputLocked,
    inviteCodeInput: invite.inviteCodeInput,
    inviteStatus: invite.inviteStatus,
    inviteBlockedMsg: invite.inviteBlockedMsg,
    handleApplyInviteCode: invite.handleApplyInviteCode,
    handleRetryInviteValidation: invite.handleRetryInviteValidation,
    handleDismissStoredInviteCode: invite.handleDismissStoredInviteCode,
    handleInviteCodeChange: invite.handleInviteCodeChange,

    // ── pricing (product·payment·invite 교차) ──
    unitPrice,
    quantity,
    setQuantity,
    basePrice,
    couponDiscount,
    totalDiscount,
    total,

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
