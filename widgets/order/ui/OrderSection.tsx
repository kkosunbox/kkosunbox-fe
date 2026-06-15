"use client";

import Image from "next/image";
import Script from "next/script";
import {
  useOrderSectionState,
  type OrderSectionProps,
} from "./order-section/useOrderSectionState";
import { OrderPriceSummaryBar } from "./order-section/OrderPriceSummaryBar";
import { OrderProductSection } from "./order-section/OrderProductSection";
import { OrderCustomerSection } from "./order-section/OrderCustomerSection";
import { OrderPaymentSection } from "./order-section/OrderPaymentSection";
import { OrderInviteSection } from "./order-section/OrderInviteSection";
import { OrderDeliveryMethodSection } from "./order-section/OrderDeliveryMethodSection";
import { OrderSummarySection } from "./order-section/OrderSummarySection";

export type { OrderSectionProps };

export default function OrderSection(props: OrderSectionProps) {
  const {
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
  } = useOrderSectionState(props);

  const leftSections = (
    <div className="flex flex-col max-md:gap-9 md:gap-4">
      <OrderProductSection
        plan={props.plan}
        open={openSections.product}
        onToggle={() => toggleSection("product")}
        orderPlanTheme={orderPlanTheme}
        unitPrice={unitPrice}
        quantity={quantity}
        setQuantity={setQuantity}
      />
      <OrderCustomerSection
        open={openSections.customer}
        onToggle={() => toggleSection("customer")}
        selectedAddress={selectedAddress}
        onChangeAddress={handleChangeAddress}
        newAddr={newAddr}
        setNewAddr={setNewAddr}
        phoneError={phoneError}
        setPhoneError={setPhoneError}
        onSearchAddress={handleSearchAddress}
      />
      <OrderPaymentSection
        open={openSections.payment}
        onToggle={() => toggleSection("payment")}
        paymentMethod={paymentMethod}
        billing={billing}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        openPaymentPopup={openPaymentPopup}
        couponEnabled={couponEnabled}
        onToggleCoupon={handleToggleCoupon}
        couponCodeInput={couponCodeInput}
        setCouponCodeInput={setCouponCodeInput}
        couponInfo={couponInfo}
        couponError={couponError}
        couponDiscount={couponDiscount}
        onApplyCoupon={() => void handleApplyCoupon()}
      />
      {inviteSectionMode !== "hidden" && (
        <OrderInviteSection
          open={openSections.invite}
          onToggle={() => toggleSection("invite")}
          inviteSectionMode={inviteSectionMode}
          inviteCodeInput={inviteCodeInput}
          onInviteCodeChange={handleInviteCodeChange}
          inviteStatus={inviteStatus}
          inviteBlockedMsg={inviteBlockedMsg}
          isInviteInputLocked={isInviteInputLocked}
          onApplyInviteCode={handleApplyInviteCode}
          onRetryInviteValidation={handleRetryInviteValidation}
          onDismissStoredInviteCode={handleDismissStoredInviteCode}
        />
      )}
      <OrderDeliveryMethodSection
        open={openSections.date}
        onToggle={() => toggleSection("date")}
      />
    </div>
  );

  const rightColumn = (
    <div className="flex flex-col max-md:gap-9 md:gap-4">
      <OrderSummarySection
        open={openSections.summary}
        onToggle={() => toggleSection("summary")}
        quantity={quantity}
        basePrice={basePrice}
        totalDiscount={totalDiscount}
        total={total}
        agreeOpen={agreeOpen}
        setAgreeOpen={setAgreeOpen}
        agreeTerms={agreeTerms}
        setAgreeTerms={setAgreeTerms}
        agreePrivacy={agreePrivacy}
        setAgreePrivacy={setAgreePrivacy}
        agreeAge={agreeAge}
        setAgreeAge={setAgreeAge}
        agreeAll={agreeAll}
        handleAgreeAll={handleAgreeAll}
        submitError={submitError}
        isPending={isPending}
        handlePay={handlePay}
      />
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

  return (
    <div className="pt-[var(--header-offset)]">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      <OrderPriceSummaryBar basePrice={basePrice} totalDiscount={totalDiscount} total={total} />

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
