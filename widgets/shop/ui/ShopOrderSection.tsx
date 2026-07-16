"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  useModal,
  SectionCard,
  Checkbox,
  RadioButton,
  QuantityMinusIcon,
  QuantityPlusIcon,
} from "@/shared/ui";
import {
  SHOP_FREE_SHIPPING_THRESHOLD,
  SHOP_SHIPPING_FEE,
  type ShopProduct,
} from "@/entities/product";
import { digitsOnly, isValidKoreanPhone, formatKrwPrice } from "@/shared/lib/format";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { ShopProductArt } from "./ShopProductArt";

const PAYMENT_METHODS = ["신용·체크카드", "카카오페이", "네이버페이"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

interface ShopOrderSectionProps {
  product: ShopProduct;
  initialAddresses: DeliveryAddress[];
}

export default function ShopOrderSection({ product, initialAddresses }: ShopOrderSectionProps) {
  const router = useRouter();
  const { openAlert } = useModal();

  const [openSections, setOpenSections] = useState({
    product: true,
    customer: true,
    payment: true,
    summary: true,
  });
  const [quantity, setQuantity] = useState(1);
  const address = useAddressState({ initialAddresses });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("신용·체크카드");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useExternalMessages({ onAddressSelected: address.handleAddressSelected });

  const agreeAll = agreeTerms && agreePrivacy;

  const basePrice = product.price * quantity;
  const shippingFee = basePrice >= SHOP_FREE_SHIPPING_THRESHOLD ? 0 : SHOP_SHIPPING_FEE;
  const total = basePrice + shippingFee;

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleAgreeAll() {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
  }

  function handlePay() {
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

    // 실제 PG 연동 전 데모 — 결제 API 연동 시 이 블록을 교체한다.
    openAlert({
      type: "success",
      title: "주문이 완료되었습니다",
      description: `${product.name} ${quantity}개 주문이 접수되었어요.\n(심사용 데모로 실제 결제는 진행되지 않아요)`,
      primaryLabel: "확인",
      onPrimary: () => router.push("/shop"),
    });
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
                    <ShopProductArt glyph={product.glyph} colorVar={product.colorVar} />
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
                  {PAYMENT_METHODS.map((method) => (
                    <RadioButton
                      key={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      label={method}
                    />
                  ))}
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
                    onClick={handlePay}
                    className="mt-1 flex h-12 w-full items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80"
                  >
                    {formatKrwPrice(total)} 결제하기
                  </button>
                  <p className="text-center text-caption-12-r text-[var(--color-text-secondary)]">
                    심사용 데모 화면으로, 실제 결제가 진행되지 않습니다.
                  </p>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
