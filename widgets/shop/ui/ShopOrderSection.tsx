"use client";

import { useEffect, useRef, useState } from "react";
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
} from "@/shared/ui";
import {
  SHOP_FREE_SHIPPING_THRESHOLD,
  SHOP_SHIPPING_FEE,
  SHOP_PRODUCT_IMAGES,
  type ShopProduct,
} from "@/entities/product";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { digitsOnly, isValidKoreanPhone, formatKrwPrice } from "@/shared/lib/format";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { isTossUserCancel } from "@/features/billing/lib/requestTossBillingAuth";

// 문서용 테스트 키 (Toss 결제위젯 SDK v1, 일반/단건 결제) — /test/toss와 동일한 Toss 공식 문서 테스트 키.
// 자동결제(빌링) 계약 상태와 무관하게 동작하며, 실제 금액이 청구되지 않는다.
const WIDGET_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

interface ShopOrderSectionProps {
  product: ShopProduct;
  initialAddresses: DeliveryAddress[];
}

export default function ShopOrderSection({ product, initialAddresses }: ShopOrderSectionProps) {
  const [openSections, setOpenSections] = useState({
    product: true,
    customer: true,
    payment: true,
    summary: true,
  });
  const [quantity, setQuantity] = useState(1);
  const address = useAddressState({ initialAddresses });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const paymentMethodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);

  useExternalMessages({ onAddressSelected: address.handleAddressSelected });

  const agreeAll = agreeTerms && agreePrivacy;

  const basePrice = product.price * quantity;
  const shippingFee = basePrice >= SHOP_FREE_SHIPPING_THRESHOLD ? 0 : SHOP_SHIPPING_FEE;
  const total = basePrice + shippingFee;

  // 결제위젯 SDK는 페이지 진입 시 미리 로드해 둔다.
  useEffect(() => {
    let mounted = true;
    const customerKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `shop-${Date.now()}`;
    (async () => {
      try {
        const widget = await loadPaymentWidget(WIDGET_CLIENT_KEY, customerKey);
        if (mounted) setPaymentWidget(widget);
      } catch (err) {
        console.error("결제위젯 로드 실패:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 위젯 로드 완료 시 결제수단/약관 UI를 렌더링한다.
  useEffect(() => {
    if (!paymentWidget) return;

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#shop-payment-widget",
      { value: total },
      { variantKey: "DEFAULT" },
    );
    paymentWidget.renderAgreement("#shop-payment-agreement", { variantKey: "AGREEMENT" });

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

    const receiverName = address.selectedAddress?.receiverName ?? address.newAddr.receiverName;

    setIsPaying(true);
    try {
      await paymentWidget.requestPayment({
        orderId: crypto.randomUUID(),
        orderName: `${product.name} ${quantity}개`,
        customerName: receiverName.trim() || undefined,
        successUrl: `${window.location.origin}/shop/order/success?productId=${product.id}&quantity=${quantity}`,
        failUrl: `${window.location.origin}/shop/order/fail?productId=${product.id}`,
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
                      src={SHOP_PRODUCT_IMAGES[product.id]}
                      alt={product.name}
                      fill
                      quality={HIGH_IMAGE_QUALITY}
                      className="object-cover"
                      sizes="(max-width: 359px) 112px, (max-width: 767px) 132px, 117px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <span
                      className="inline-flex w-fit items-center justify-center rounded-[30px] px-3 py-1 text-body-14-sb leading-[17px] text-white"
                      style={{ background: product.colorVar }}
                    >
                      {product.category}
                    </span>
                    <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">
                      {product.name} ({product.weight})
                    </span>
                    <span className="text-price-16-eb text-[var(--color-surface-dark)]">
                      {formatKrwPrice(product.price)}
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
                  <div id="shop-payment-widget" />
                  <div id="shop-payment-agreement" />
                  {!paymentReady ? (
                    <p className="text-center text-body-13-m text-[var(--color-text-secondary)]">
                      결제 UI를 불러오는 중…
                    </p>
                  ) : null}
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
