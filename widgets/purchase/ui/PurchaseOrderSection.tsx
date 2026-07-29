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
  CollapsiblePanel,
  ChevronIcon,
  QuantityMinusIcon,
  QuantityPlusIcon,
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
import { TOSS_WIDGET_CLIENT_KEY } from "@/shared/lib/payments/tossWidgetClient";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { isTossUserCancel } from "@/features/billing/lib/requestTossBillingAuth";
import { computeOrderPricing } from "@/features/order/lib/orderPricing";
import { createProductOrder } from "@/features/product/api/productApi";
import { getErrorMessage } from "@/shared/lib/api";
import { OrderPriceSummaryBar } from "@/widgets/order/ui/order-section/OrderPriceSummaryBar";
import { OrderDeliveryMethodSection } from "@/widgets/order/ui/order-section/OrderDeliveryMethodSection";

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

interface PurchaseOrderSectionProps {
  pkg: PackageData;
  purchaseProduct: PackagePurchaseProduct;
  initialAddresses: DeliveryAddress[];
  /** 백엔드 상품 카탈로그에서 매칭된 실제 상품 ID. 카탈로그가 비어있으면 null — 결제 시 안내 후 차단 */
  productId: number | null;
}

export default function PurchaseOrderSection({
  pkg,
  purchaseProduct,
  initialAddresses,
  productId,
}: PurchaseOrderSectionProps) {
  const [openSections, setOpenSections] = useState({
    product: true,
    customer: true,
    payment: true,
    delivery: true,
    summary: true,
  });
  const [quantity, setQuantity] = useState(1);
  const address = useAddressState({ initialAddresses });
  const [agreeOpen, setAgreeOpen] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [widgetLoadError, setWidgetLoadError] = useState<string | null>(null);
  const paymentMethodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);
  const mountedRef = useRef(true);

  useExternalMessages({ onAddressSelected: address.handleAddressSelected });

  const agreeAll = agreeTerms && agreePrivacy;

  // 단건 구매는 쿠폰 적용이 불가능하다 — couponRatePercent를 전달하지 않아 totalDiscount는 항상 0
  const { basePrice, totalDiscount, total: productTotal } = computeOrderPricing({
    unitPrice: purchaseProduct.price,
    quantity,
  });
  // 단건 구매 무료배송 이벤트 — 원래 배송비는 취소선으로만 표시하고 실제로는 0원 청구
  const originalShippingFee = basePrice >= SHOP_FREE_SHIPPING_THRESHOLD ? 0 : SHOP_SHIPPING_FEE;
  const shippingFee = 0;
  const total = productTotal + shippingFee;

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

    if (productId === null) {
      setSubmitError("현재 이 상품은 준비 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const receiverName = address.selectedAddress?.receiverName ?? address.newAddr.receiverName;

    setIsPaying(true);
    try {
      const deliveryAddressId = address.selectedAddressId ?? (await address.createAddress());
      if (deliveryAddressId === null) {
        setSubmitError("배송지를 선택하거나 입력해 주세요.");
        return;
      }

      const order = await createProductOrder(productId, { deliveryAddressId, quantity });

      // 결제위젯에 바인딩된 금액을 백엔드가 계산한 실제 금액으로 맞춘다 — confirm 시 금액 불일치(PRODUCT_ORDER_AMOUNT_MISMATCH) 방지
      paymentMethodsWidgetRef.current?.updateAmount(order.amount);

      await paymentWidget.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        customerName: receiverName.trim() || undefined,
        successUrl: `${window.location.origin}/purchase/order/success`,
        failUrl: `${window.location.origin}/purchase/order/fail`,
      });
    } catch (err) {
      if (isTossUserCancel(err)) return;
      setSubmitError(getErrorMessage(err, "결제 요청 중 오류가 발생했습니다. 다시 시도해주세요."));
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

      <OrderPriceSummaryBar
        basePrice={basePrice}
        totalDiscount={totalDiscount}
        shippingFee={shippingFee}
        originalShippingFee={originalShippingFee}
        total={total}
      />

      <div className="bg-white">
        <div
          className="mx-auto max-lg:px-6 max-md:pt-6 md:py-8 lg:px-0"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <div className="grid items-start max-md:gap-y-9 md:grid-cols-[55%_1px_1fr] md:gap-x-6 lg:grid-cols-[1fr_1px_327px] lg:gap-x-8">
            {/* 좌측 — 제품 · 배송지 · 결제수단 · 배송방법 */}
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

              <OrderDeliveryMethodSection
                open={openSections.delivery}
                onToggle={() => toggleSection("delivery")}
              />
            </div>

            <div className="max-md:hidden self-stretch bg-[var(--color-text-muted)]" />

            {/* 우측 — 결제 정보 · 약관 · 결제 버튼 */}
            <div className="flex flex-col max-md:gap-9 md:gap-4">
              <SectionCard title="결제정보" open={openSections.summary} onToggle={() => toggleSection("summary")}>
                <div className="flex flex-col max-md:gap-4 md:gap-8">
                  <div className="flex flex-col max-md:gap-4 md:gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-body-13-m text-[var(--color-text)]">주문상품금액</span>
                      <span className="text-body-13-m text-[var(--color-text)]">{formatKrwPrice(basePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-13-m text-[var(--color-text)]">총 쿠폰 할인금액</span>
                      <span className="text-body-13-m text-[var(--color-text)]">-{formatKrwPrice(totalDiscount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-13-m text-[var(--color-text)]">총 배송비</span>
                      <span className="text-body-13-m text-[var(--color-text)]">
                        {originalShippingFee > shippingFee && (
                          <span className="mr-1 text-[var(--color-text-secondary)] line-through">
                            -{formatKrwPrice(originalShippingFee)}
                          </span>
                        )}
                        -{formatKrwPrice(shippingFee)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--color-border-light)]" />

                  <div className="flex items-center justify-between">
                    <span className="text-body-14-b text-[var(--color-text)]">단품구매</span>
                    <span className="text-price-20-eb text-[var(--color-text)]">{formatKrwPrice(total)}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Checkbox checked={agreeAll} onChange={handleAgreeAll} label="모두 동의합니다." />
                      <button
                        type="button"
                        aria-label={agreeOpen ? "약관 항목 접기" : "약관 항목 펼치기"}
                        onClick={() => setAgreeOpen((v) => !v)}
                        aria-expanded={agreeOpen}
                        aria-controls="purchase-agreements-panel"
                      >
                        <ChevronIcon open={agreeOpen} size={20} />
                      </button>
                    </div>
                    <CollapsiblePanel
                      id="purchase-agreements-panel"
                      open={agreeOpen}
                      className="mt-3"
                      innerClassName="flex flex-col gap-2.5 border-t border-[var(--color-border-light)] pt-3 pl-1"
                    >
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
                    </CollapsiblePanel>
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
                    {isPaying ? "결제 요청 중…" : "결제하기"}
                  </button>
                </div>
              </SectionCard>

              <div className="overflow-hidden max-md:mx-[calc(50%_-_50vw)] max-md:rounded-none md:rounded-[8px]">
                <Image
                  src="/images/sidebar-banner-001.png"
                  alt="꼬순박스 배너"
                  width={375}
                  height={126}
                  quality={HIGH_IMAGE_QUALITY}
                  className="h-auto w-full"
                  sizes="(min-width: 1024px) 327px, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
