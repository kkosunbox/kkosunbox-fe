"use client";

import { useMemo, useState, useTransition } from "react";
import { useAgreementState } from "./hooks/useAgreementState";
import { useInviteState } from "./hooks/useInviteState";
import { usePaymentState } from "./hooks/usePaymentState";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import { useRouter } from "next/navigation";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import type { BillingInfo } from "@/features/billing/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { createSubscription } from "@/features/subscription/api/subscriptionApi";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import { clearStoredInviteCode } from "@/features/referral/lib";
import { computeOrderPricing } from "@/features/order";
import { requestTossBillingAuth, isTossUserCancel } from "@/features/billing/lib/requestTossBillingAuth";
import { packageThemeForPlan } from "@/entities/package";
import { trackPurchase } from "@/shared/lib/analytics";
import { isValidKoreanPhone } from "@/shared/lib/format";
export type { NewAddrState } from "@/features/delivery-address/lib";

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
  const [isPending, startTransition] = useTransition();
  const agreement = useAgreementState();
  const address = useAddressState({ initialAddresses });
  const payment = usePaymentState({ initialBilling });
  const invite = useInviteState({ initialInviteCode, hasSubscriptionHistory });

  const [openSections, setOpenSections] = useState({
    product: true,
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
  // 금액·할인 계산은 순수 함수로 분리(단위 테스트 대상). 쿠폰·초대코드 모두 단가 1개에만 적용.
  const { basePrice, couponDiscount, totalDiscount, total } = useMemo(
    () =>
      computeOrderPricing({
        unitPrice,
        quantity,
        couponRatePercent: payment.couponInfo?.canUse ? payment.couponInfo.discountRate : null,
        inviteRate: invite.inviteStatus === "applicable" ? invite.inviteDiscountRate : null,
      }),
    [unitPrice, quantity, payment.couponInfo, invite.inviteStatus, invite.inviteDiscountRate],
  );

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // 카드 미등록 상태에서 결제하기를 누르면 Toss 자동결제 등록창을 띄운다.
  // 등록 완료(성공 시 successUrl 리다이렉트)까지는 팝업이 아닌 페이지 자체 이동이라
  // 주문 폼 상태가 소실된다 — 등록 후에는 /subscribe로 돌아가 다시 결제해야 한다(별도 팝업 아키텍처 재구성 예정).
  async function startTossBillingRegistration() {
    setSubmitError(null);
    try {
      await requestTossBillingAuth({
        customerKey: crypto.randomUUID(),
        billingInfoId: payment.billing?.id,
      });
    } catch (err) {
      if (isTossUserCancel(err)) return;
      setSubmitError(getErrorMessage(err, "결제 수단 등록 창을 여는 중 오류가 발생했습니다."));
    }
  }

  function handlePay() {
    setSubmitError(null);

    if (!agreement.agreeAll) {
      setSubmitError("필수 약관에 동의해 주세요.");
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

    // 카드 등록된 유저는 바로 구독 생성(즉시 결제), 미등록 유저는 Toss 카드 등록부터 진행.
    if (payment.billing) {
      proceedSubscription();
    } else {
      void startTossBillingRegistration();
    }
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
        });

        trackPurchase({
          transaction_id: String(newSub.id),
          value: total,
          plan_tier: plan.name,
          quantity,
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
