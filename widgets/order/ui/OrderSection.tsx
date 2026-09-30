"use client";

import { useEffect } from "react";
import Script from "next/script";
import { CheckoutPromotionBanner } from "@/shared/ui";
import { trackBeginCheckout } from "@/shared/lib/analytics";
import {
  useOrderSectionState,
  type OrderSectionProps,
} from "./order-section/useOrderSectionState";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { OrderPriceSummaryBar } from "./order-section/OrderPriceSummaryBar";
import { OrderProductSection } from "./order-section/OrderProductSection";
import { OrderStartDateSection } from "./order-section/OrderStartDateSection";
import { OrderPaymentSection } from "./order-section/OrderPaymentSection";
import { OrderDeliveryMethodSection } from "./order-section/OrderDeliveryMethodSection";
import { OrderSummarySection } from "./order-section/OrderSummarySection";

export type { OrderSectionProps };

export default function OrderSection(props: OrderSectionProps) {
  useEffect(() => {
    trackBeginCheckout({ plan_tier: props.plan.name, value: props.plan.monthlyPrice });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    agreeOpen,
    onToggleAgreePanel,
    agreeTerms,
    onToggleTerms,
    agreePrivacy,
    onTogglePrivacy,
    agreeAge,
    onToggleAge,
    agreeAll,
    quantity,
    setQuantity,
    billing,
    submitError,
    phoneError,
    setPhoneError,
    isPending,
    isQuoting,
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
    startDateMode,
    scheduledDate,
    minScheduledDate,
    maxScheduledDate,
    handleStartDateModeChange,
    handleScheduledDateChange,
    handleToggleCoupon,
    handleSelectPaymentMethod,
    handleChangeCard,
    handleAgreeAll,
  } = useOrderSectionState(props);

  const leftSections = (
    <div className="flex flex-col max-md:gap-9 md:gap-10">
      <OrderProductSection
        plan={props.plan}
        open={openSections.product}
        onToggle={() => toggleSection("product")}
        orderPlanTheme={orderPlanTheme}
        unitPrice={unitPrice}
        quantity={quantity}
        setQuantity={setQuantity}
      />
      <OrderStartDateSection
        open={openSections.startDate}
        onToggle={() => toggleSection("startDate")}
        startDateMode={startDateMode}
        onStartDateModeChange={handleStartDateModeChange}
        scheduledDate={scheduledDate}
        onScheduledDateChange={handleScheduledDateChange}
        minScheduledDate={minScheduledDate}
        maxScheduledDate={maxScheduledDate}
      />
      <CheckoutAddressSection
        variant="order"
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
        onChangeCard={handleChangeCard}
        couponEnabled={couponEnabled}
        onToggleCoupon={handleToggleCoupon}
        couponCodeInput={couponCodeInput}
        setCouponCodeInput={setCouponCodeInput}
        couponInfo={couponInfo}
        couponError={couponError}
        couponDiscount={couponDiscount}
        onApplyCoupon={() => void handleApplyCoupon()}
      />
      <OrderDeliveryMethodSection
        open={openSections.date}
        onToggle={() => toggleSection("date")}
      />
    </div>
  );

  const rightColumn = (
    <div className="flex min-w-0 flex-col gap-6">
      <OrderSummarySection
        open={openSections.summary}
        onToggle={() => toggleSection("summary")}
        quantity={quantity}
        basePrice={basePrice}
        totalDiscount={totalDiscount}
        total={total}
        agreeOpen={agreeOpen}
        onToggleAgreePanel={onToggleAgreePanel}
        agreeTerms={agreeTerms}
        onToggleTerms={onToggleTerms}
        agreePrivacy={agreePrivacy}
        onTogglePrivacy={onTogglePrivacy}
        agreeAge={agreeAge}
        onToggleAge={onToggleAge}
        agreeAll={agreeAll}
        handleAgreeAll={handleAgreeAll}
        submitError={submitError}
        isPending={isPending}
        isQuoting={isQuoting}
        hasBilling={billing !== null}
        handlePay={handlePay}
      />
      <CheckoutPromotionBanner />

    </div>
  );

  return (
    <div className="pt-[var(--header-offset)]">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      <OrderPriceSummaryBar
        productLabel="구독상품금액"
        totalLabel="월 요금제"
        basePrice={basePrice}
        totalDiscount={totalDiscount}
        shippingFee={0}
        total={total}
      />

      <div className="bg-white">
        <div
          className="mx-auto w-full max-w-[1288px] px-6 max-md:py-6 md:pt-[52px] md:pb-[190px]"
        >
          <div className="grid items-start max-md:gap-y-9 md:grid-cols-[minmax(0,1fr)_1px_280px] md:gap-x-6 lg:grid-cols-[minmax(0,835fr)_1px_minmax(0,300fr)] lg:gap-x-[52px]">
            {leftSections}
            <div className="max-md:hidden self-stretch bg-[var(--color-text-muted)]" />
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
