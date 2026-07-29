"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import {
  loadPaymentWidget,
  type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";
import {
  SectionCard,
  Checkbox,
  QuantityMinusIcon,
  QuantityPlusIcon,
  FORM_INPUT_CLASS,
  FORM_ACTION_CHIP_CLASS,
} from "@/shared/ui";
import {
  TIER_BOX_IMAGES,
  TIER_LABEL,
  type PackageData,
  type PackagePurchaseProduct,
} from "@/entities/package";
import { SHOP_FREE_SHIPPING_THRESHOLD, SHOP_SHIPPING_FEE } from "@/entities/product";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { digitsOnly, isValidKoreanPhone, formatKrwPrice } from "@/shared/lib/format";
import { getErrorMessage } from "@/shared/lib/api";
import { TOSS_WIDGET_CLIENT_KEY } from "@/shared/lib/payments/tossWidgetClient";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { isTossUserCancel } from "@/features/billing/lib/requestTossBillingAuth";
import { getCouponInfo } from "@/features/subscription/api/subscriptionApi";
import type { CouponInfo } from "@/features/subscription/api/types";
import { computeOrderPricing } from "@/features/order/lib/orderPricing";

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

interface PurchaseOrderSectionProps {
  pkg: PackageData;
  purchaseProduct: PackagePurchaseProduct;
  initialAddresses: DeliveryAddress[];
}

export default function PurchaseOrderSection({
  pkg,
  purchaseProduct,
  initialAddresses,
}: PurchaseOrderSectionProps) {
  const [openSections, setOpenSections] = useState({
    product: true,
    customer: true,
    coupon: true,
    payment: true,
    summary: true,
  });
  const [quantity, setQuantity] = useState(1);
  const address = useAddressState({ initialAddresses });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const [couponEnabled, setCouponEnabled] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [widgetLoadError, setWidgetLoadError] = useState<string | null>(null);
  const paymentMethodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);
  const mountedRef = useRef(true);

  useExternalMessages({ onAddressSelected: address.handleAddressSelected });

  const agreeAll = agreeTerms && agreePrivacy;

  const { basePrice, couponDiscount, total: discountedProductTotal } = computeOrderPricing({
    unitPrice: purchaseProduct.price,
    quantity,
    couponRatePercent: couponInfo?.canUse ? couponInfo.discountRate : null,
  });
  const shippingFee = basePrice >= SHOP_FREE_SHIPPING_THRESHOLD ? 0 : SHOP_SHIPPING_FEE;
  const total = discountedProductTotal + shippingFee;

  const loadWidget = useCallback(async () => {
    setWidgetLoadError(null);
    const customerKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `purchase-${Date.now()}`;
    try {
      const widget = await loadPaymentWidget(TOSS_WIDGET_CLIENT_KEY, customerKey);
      if (mountedRef.current) setPaymentWidget(widget);
    } catch (err) {
      console.error("결제위젯 로드 실패:", err);
      if (mountedRef.current) {
        setWidgetLoadError("결제 UI를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  }, []);

  // 결제위젯 SDK는 페이지 진입 시 미리 로드해 둔다.
  useEffect(() => {
    mountedRef.current = true;
    void loadWidget();
    return () => {
      mountedRef.current = false;
    };
  }, [loadWidget]);

  // 위젯 로드 완료 시 결제수단/약관 UI를 렌더링한다.
  useEffect(() => {
    if (!paymentWidget) return;

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#purchase-payment-widget",
      { value: total },
      { variantKey: "DEFAULT" },
    );
    paymentWidget.renderAgreement("#purchase-payment-agreement", { variantKey: "AGREEMENT" });

    paymentMethodsWidget.on("ready", () => setPaymentReady(true));
    paymentMethodsWidgetRef.current = paymentMethodsWidget;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 렌더 1회만 수행, 금액 갱신은 아래 이펙트가 담당
  }, [paymentWidget]);

  // 수량 변경에 따른 결제 금액 갱신
  useEffect(() => {
    paymentMethodsWidgetRef.current?.updateAmount(total);
  }, [total]);

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleAgreeAll() {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
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

  async function handlePay() {
    setSubmitError(null);

    if (!agreeAll) {
      setSubmitError("필수 약관에 동의해 주세요.");
      return;
    }

    if (!address.selectedAddress) {
      const rawPhone = digitsOnly(address.newAddr.phoneNumber);
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

    if (!paymentWidget) {
      setSubmitError("결제 UI를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const receiverName = address.selectedAddress?.receiverName ?? address.newAddr.receiverName;

    setIsPaying(true);
    try {
      await paymentWidget.requestPayment({
        orderId: crypto.randomUUID(),
        orderName: `${pkg.name} ${quantity}개`,
        customerName: receiverName.trim() || undefined,
        successUrl: `${window.location.origin}/purchase/order/success?tier=${pkg.tier}&quantity=${quantity}`,
        failUrl: `${window.location.origin}/purchase/order/fail?tier=${pkg.tier}`,
      });
    } catch (err) {
      if (isTossUserCancel(err)) return;
      setSubmitError("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div className="pt-[var(--header-offset)]">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />

      <div className="bg-white">
        <div
          className="mx-auto max-lg:px-6 max-md:pt-6 md:py-8 lg:px-0"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <div className="grid items-start max-md:gap-y-9 md:grid-cols-[55%_1px_1fr] md:gap-x-6 lg:grid-cols-[1fr_1px_327px] lg:gap-x-8">
            {/* 좌측 — 제품 · 배송지 · 결제수단 */}
            <div className="flex flex-col max-md:gap-9 md:gap-4">
              <SectionCard title="제품 정보" open={openSections.product} onToggle={() => toggleSection("product")}>
                <div className="flex w-full items-center max-sm:gap-4 sm:gap-6">
                  <div className="relative shrink-0 overflow-hidden rounded-[12px] max-sm:h-[104px] max-sm:w-[112px] sm:h-[122px] sm:w-[132px] md:h-[117px] md:w-[117px] md:rounded-[16px]">
                    <Image
                      src={TIER_BOX_IMAGES[pkg.tier]}
                      alt={pkg.name}
                      fill
                      quality={HIGH_IMAGE_QUALITY}
                      className="object-cover"
                      sizes="(max-width: 359px) 112px, (max-width: 767px) 132px, 117px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <span
                      className="inline-flex w-fit items-center justify-center rounded-[30px] px-3 py-1 text-body-14-sb leading-[17px] text-white"
                      style={{ background: pkg.colorVar }}
                    >
                      {TIER_LABEL[pkg.tier]}
                    </span>
                    <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
                      {pkg.name}
                    </span>
                    <span className="text-price-16-eb text-[var(--color-surface-dark)]">
                      {formatKrwPrice(purchaseProduct.price)}
                    </span>
                    <div className="mt-1 flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="수량 감소"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-[var(--color-border)] text-body-14-sb text-[var(--color-text)] disabled:opacity-30"
                      >
                        <span className="max-md:hidden" aria-hidden>−</span>
                        <span className="md:hidden">
                          <QuantityMinusIcon />
                        </span>
                      </button>
                      <span className="min-w-[20px] text-center text-body-14-sb text-[var(--color-text)]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="수량 증가"
                        onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                        disabled={quantity >= 99}
                        className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-[var(--color-border)] text-body-14-sb text-[var(--color-text)] disabled:opacity-30"
                      >
                        <span className="max-md:hidden" aria-hidden>+</span>
                        <span className="md:hidden">
                          <QuantityPlusIcon />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <CheckoutAddressSection
                open={openSections.customer}
                onToggle={() => toggleSection("customer")}
                selectedAddress={address.selectedAddress}
                onChangeAddress={address.handleChangeAddress}
                newAddr={address.newAddr}
                setNewAddr={address.setNewAddr}
                phoneError={address.phoneError}
                setPhoneError={address.setPhoneError}
                onSearchAddress={address.handleSearchAddress}
              />

              <SectionCard title="쿠폰" open={openSections.coupon} onToggle={() => toggleSection("coupon")}>
                <div className="flex flex-col gap-3 pb-1">
                  <Checkbox checked={couponEnabled} onChange={handleToggleCoupon} label="쿠폰사용" />
                  {couponEnabled && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-0 md:items-center md:gap-4">
                        <span className="shrink-0 pt-3 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px] md:pt-0">
                          쿠폰입력
                        </span>
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <input
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value)}
                            className={`${FORM_INPUT_CLASS} min-w-0 flex-1`}
                            placeholder="코드 입력"
                            aria-label="쿠폰 코드"
                          />
                          <button type="button" onClick={() => void handleApplyCoupon()} className={FORM_ACTION_CHIP_CLASS}>
                            쿠폰적용
                          </button>
                        </div>
                        {couponInfo?.canUse ? (
                          <span className="shrink-0 text-body-13-m text-[var(--color-text-secondary)]">
                            {couponInfo.name ?? "할인쿠폰"} {couponInfo.discountRate}% -{formatKrwPrice(couponDiscount)}
                          </span>
                        ) : null}
                      </div>
                      {couponError ? (
                        <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]" role="alert">
                          {couponError}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="결제 수단" open={openSections.payment} onToggle={() => toggleSection("payment")}>
                <div className="flex flex-col gap-4 pb-1">
                  {widgetLoadError ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <p className="text-center text-body-13-m text-red-600" role="alert">
                        {widgetLoadError}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadWidget()}
                        className="rounded-[6px] border border-[var(--color-border)] px-4 py-2 text-body-13-sb text-[var(--color-text)] hover:bg-[var(--color-surface-warm)]"
                      >
                        다시 시도
                      </button>
                    </div>
                  ) : (
                    <>
                      <div id="purchase-payment-widget" />
                      <div id="purchase-payment-agreement" />
                      {!paymentReady ? (
                        <p className="text-center text-body-13-m text-[var(--color-text-secondary)]">
                          결제 UI를 불러오는 중…
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              </SectionCard>
            </div>

            <div className="max-md:hidden self-stretch bg-[var(--color-text-muted)]" />

            {/* 우측 — 결제 금액 · 약관 · 결제 버튼 */}
            <div className="flex flex-col max-md:gap-9 md:gap-4">
              <SectionCard title="결제 금액" open={openSections.summary} onToggle={() => toggleSection("summary")}>
                <div className="flex flex-col gap-3 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body-13-m text-[var(--color-text-body-warm)]">상품 금액</span>
                    <span className="text-price-14-sb text-[var(--color-text)]">{formatKrwPrice(basePrice)}</span>
                  </div>
                  {couponDiscount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-body-13-m text-[var(--color-text-body-warm)]">쿠폰 할인</span>
                      <span className="text-price-14-sb text-[var(--color-cta-button)]">
                        -{formatKrwPrice(couponDiscount)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-body-13-m text-[var(--color-text-body-warm)]">배송비</span>
                    <span className="text-price-14-sb text-[var(--color-text)]">
                      {shippingFee === 0 ? "무료" : formatKrwPrice(shippingFee)}
                    </span>
                  </div>
                  {shippingFee > 0 ? (
                    <p className="text-caption-12-r text-[var(--color-text-secondary)]">
                      {formatKrwPrice(SHOP_FREE_SHIPPING_THRESHOLD)} 이상 구매 시 무료배송
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-[var(--color-border-light)] pt-3">
                    <span className="text-price-16-b-tight text-[var(--color-text-body-warm)]">총 결제 금액</span>
                    <span className="text-price-20-eb-lh24 text-[var(--color-text-emphasis)]">
                      {formatKrwPrice(total)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-col gap-3 border-t border-[var(--color-border-light)] pt-4">
                    <Checkbox checked={agreeAll} onChange={handleAgreeAll} label="아래 약관에 모두 동의합니다." />
                    <div className="flex flex-col gap-2 pl-7">
                      <Checkbox
                        checked={agreeTerms}
                        onChange={() => setAgreeTerms((v) => !v)}
                        label="(필수) 구매조건 및 결제진행 동의"
                      />
                      <Checkbox
                        checked={agreePrivacy}
                        onChange={() => setAgreePrivacy((v) => !v)}
                        label="(필수) 개인정보 수집·이용 동의"
                      />
                    </div>
                  </div>

                  {submitError ? (
                    <p className="text-body-13-m text-red-600" role="alert">
                      {submitError}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handlePay()}
                    disabled={!paymentReady || isPaying}
                    className="mt-1 flex h-12 w-full items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
                  >
                    {isPaying ? "결제 요청 중…" : `${formatKrwPrice(total)} 결제하기`}
                  </button>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
