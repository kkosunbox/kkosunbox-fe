"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 백엔드의 동적 URL이다. */

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { getGuestCartLines } from "@/features/cart";
import { isTossUserCancel } from "@/features/billing/lib/requestTossBillingAuth";
import { EMPTY_ADDR_STATE, openAddressSearchPopup, type NewAddrState } from "@/features/delivery-address/lib";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { isValidGuestPhone } from "@/features/guest-order";
import {
  createGuestOrder,
  getProducts,
  quoteGuestOrder,
  type GuestOrderLine,
  type GuestOrderQuoteResponse,
  type ProductDto,
} from "@/features/product/api";
import { getErrorMessage } from "@/shared/lib/api";
import { digitsOnly, formatKrwPrice, formatPhoneNumber } from "@/shared/lib/format";
import {
  CheckoutPromotionBanner,
  FORM_INPUT_CLASS,
  FORM_ACTION_CHIP_CLASS,
  FormRow,
  LoadingOverlay,
  QuantityMinusIcon,
  QuantityPlusIcon,
  SectionCard,
} from "@/shared/ui";
import { OrderDeliveryMethodSection } from "@/widgets/order/ui/order-section/OrderDeliveryMethodSection";
import { OrderPriceSummaryBar } from "@/widgets/order/ui/order-section/OrderPriceSummaryBar";
import { PurchaseOrderSummaryCard } from "@/widgets/purchase/ui/purchase-order-section/components/PurchaseOrderSummaryCard";
import { usePurchasePaymentWidget } from "@/widgets/purchase/ui/purchase-order-section/hooks/usePurchasePaymentWidget";
import {
  PURCHASE_AGREEMENT_ELEMENT_ID,
  PURCHASE_WIDGET_ELEMENT_ID,
  QUANTITY_MAX,
  QUANTITY_MIN,
} from "@/widgets/purchase/ui/purchase-order-section/purchaseOrderHelpers";

export type GuestOrderCheckoutSource =
  | { type: "product"; productId: number; initialQuantity: number }
  | { type: "cart"; cartItemIds: number[] };

const ORDERER_NAME_MAX_LENGTH = 50;
const QUOTE_DEBOUNCE_MS = 200;

type SectionKey = "product" | "orderer" | "delivery" | "payment" | "method" | "summary";

/** 비회원 주문서 — 주문자·배송지를 직접 입력하고 약관 동의를 받아 토스 결제위젯으로 결제한다 */
export default function GuestOrderCheckoutSection({ source }: { source: GuestOrderCheckoutSource }) {
  const [lines, setLines] = useState<GuestOrderLine[] | null>(() =>
    source.type === "product" ? [{ productId: source.productId, quantity: source.initialQuantity }] : null,
  );
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [quote, setQuote] = useState<GuestOrderQuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(true);

  const [ordererName, setOrdererName] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [ordererPhoneError, setOrdererPhoneError] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<NewAddrState>(EMPTY_ADDR_STATE);
  const [receiverPhoneError, setReceiverPhoneError] = useState<string | null>(null);

  const [agreeOpen, setAgreeOpen] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const agreeAll = agreeTerms && agreePrivacy;

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    product: true, orderer: true, delivery: true, payment: true, method: true, summary: true,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const { paymentWidget, paymentReady, widgetLoadError, reloadWidget, updateAmount } =
    usePurchasePaymentWidget({ total: quote?.amount ?? 0 });

  // 장바구니 주문 — 브라우저 장바구니에서 선택 항목을 읽는다 (localStorage라 마운트 후에만 가능)
  useEffect(() => {
    if (source.type !== "cart") return;
    setLines(getGuestCartLines(source.cartItemIds));
  }, [source]);

  useEffect(() => {
    void getProducts().then(({ products: list }) => setProducts(list)).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!lines) return;
    if (lines.length === 0) {
      setIsQuoting(false);
      setQuoteError("주문할 상품이 없습니다.");
      return;
    }
    setIsQuoting(true);
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void quoteGuestOrder({ lines })
        .then((data) => { if (!cancelled) { setQuote(data); setQuoteError(null); } })
        .catch((err) => { if (!cancelled) { setQuote(null); setQuoteError(getErrorMessage(err, "주문 금액을 계산하지 못했습니다.")); } })
        .finally(() => { if (!cancelled) setIsQuoting(false); });
    }, QUOTE_DEBOUNCE_MS);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [lines]);

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const belowMinimum = !!quote && quote.minimumOrderAmount > 0 && quote.itemsAmount < quote.minimumOrderAmount;
  const minimumNotice = belowMinimum
    ? `최소 주문 금액은 ${formatKrwPrice(quote.minimumOrderAmount)}입니다. (${formatKrwPrice(quote.minimumOrderAmount - quote.itemsAmount)} 부족)`
    : null;

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function changeQuantity(delta: number) {
    setLines((prev) => prev?.map((line) => ({
      ...line,
      quantity: Math.min(QUANTITY_MAX, Math.max(QUANTITY_MIN, line.quantity + delta)),
    })) ?? prev);
  }

  function validate(): string | null {
    if (!agreeAll) return "필수 약관에 동의해 주세요.";
    if (!ordererName.trim()) return "주문자명을 입력해 주세요.";
    if (!isValidGuestPhone(ordererPhone)) {
      setOrdererPhoneError("올바른 전화번호 형식이 아닙니다.");
      return "주문자 연락처를 확인해 주세요.";
    }
    const receiverPhone = digitsOnly(receiver.phoneNumber);
    if (!receiver.receiverName.trim() || !receiverPhone || !receiver.zipCode.trim() || !receiver.address.trim()) {
      return "배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.";
    }
    if (!isValidGuestPhone(receiverPhone)) {
      setReceiverPhoneError("올바른 전화번호 형식이 아닙니다.");
      return "받는분 연락처를 확인해 주세요.";
    }
    if (isQuoting) return "금액을 계산하는 중입니다. 잠시 후 다시 시도해 주세요.";
    if (quoteError) return quoteError;
    if (!quote || !paymentWidget) return "결제 정보를 불러오는 중입니다.";
    return null;
  }

  async function handlePay() {
    setSubmitError(null);
    const error = validate();
    if (error) { setSubmitError(error); return; }
    if (!lines || !paymentWidget) return;

    setIsPaying(true);
    try {
      const order = await createGuestOrder({
        lines,
        ordererName: ordererName.trim(),
        ordererPhone,
        receiverName: receiver.receiverName.trim(),
        receiverPhone: digitsOnly(receiver.phoneNumber),
        zipCode: receiver.zipCode.trim(),
        address: receiver.address.trim(),
        addressDetail: receiver.addressDetail.trim() || undefined,
        memo: receiver.memo.trim() || undefined,
        isAllowTerms: true,
        isAllowPrivacy: true,
      });

      // 위젯 금액을 서버가 확정한 금액으로 맞춘다 — 승인 시 금액 불일치 방지
      await updateAmount(order.amount);

      // 장바구니 주문은 결제 완료 후 주문한 항목만 브라우저 장바구니에서 지운다.
      const successQuery = source.type === "cart" ? `?cartItemIds=${source.cartItemIds.join(",")}` : "";
      await paymentWidget.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        customerName: ordererName.trim(),
        successUrl: `${window.location.origin}/purchase/guest-order/success${successQuery}`,
        failUrl: `${window.location.origin}/purchase/guest-order/fail`,
      });
    } catch (err) {
      if (isTossUserCancel(err)) return;
      setSubmitError(getErrorMessage(err, "결제 요청 중 오류가 발생했습니다. 다시 시도해주세요."));
    } finally {
      setIsPaying(false);
    }
  }

  if (!lines) return <LoadingOverlay visible />;

  return (
    <div className="pt-[var(--header-offset)]">
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />

      <OrderPriceSummaryBar
        basePrice={quote?.itemsAmount ?? 0}
        totalDiscount={quote?.couponDiscountAmount ?? 0}
        shippingFee={quote?.shippingFee ?? 0}
        total={quote?.amount ?? 0}
      />

      <div className="bg-white">
        <div className="mx-auto w-full max-w-[1288px] px-6 max-md:py-6 md:pb-[110px] md:pt-[52px]">
          <div className="grid items-start max-md:gap-y-9 md:grid-cols-[minmax(0,1fr)_1px_280px] md:gap-x-6 lg:grid-cols-[minmax(0,835fr)_1px_minmax(0,300fr)] lg:gap-x-[52px]">
            <div className="flex flex-col max-md:gap-9 md:gap-10">
              <SectionCard variant="order" title="제품정보" open={openSections.product} onToggle={() => toggleSection("product")}>
                <div className="flex flex-col gap-5 md:px-6">
                  {lines.map((line, index) => {
                    const product = productMap.get(line.productId);
                    const quoteLine = quote?.lines.find((item) => item.productId === line.productId);
                    const name = quoteLine?.productName ?? product?.name ?? "";
                    const unitPrice = quoteLine?.unitPrice ?? product?.price ?? 0;
                    return (
                      <article key={line.productId} className={`flex w-full items-center max-sm:gap-4 sm:gap-6 ${index ? "border-t border-[var(--color-border-light)] pt-5" : ""}`}>
                        {product?.imageUrl
                          ? <img src={product.imageUrl} alt={name} className="shrink-0 rounded-[12px] object-cover max-sm:h-[104px] max-sm:w-[112px] sm:max-md:h-[122px] sm:max-md:w-[132px] md:h-[148px] md:w-[160px]" />
                          : <div className="shrink-0 rounded-[12px] bg-[var(--color-surface-light)] max-sm:h-[104px] max-sm:w-[112px] sm:max-md:h-[122px] sm:max-md:w-[132px] md:h-[148px] md:w-[160px]" />}
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">{name}</span>
                            <span className="rounded-[3px] bg-[var(--color-surface-light)] px-1 text-body-12-r text-[var(--color-text-secondary)]">단품</span>
                          </div>
                          <span className="text-price-16-eb text-[var(--color-surface-dark)]">{formatKrwPrice(unitPrice)}</span>
                          {source.type === "product" ? (
                            <div className="flex items-center gap-3">
                              <button type="button" aria-label="수량 감소" onClick={() => changeQuantity(-1)} disabled={line.quantity <= QUANTITY_MIN} className="flex h-6 w-6 items-center justify-center disabled:opacity-30"><QuantityMinusIcon /></button>
                              <span className="min-w-[20px] text-center text-body-14-sb text-[var(--color-text)]">{line.quantity}</span>
                              <button type="button" aria-label="수량 증가" onClick={() => changeQuantity(1)} disabled={line.quantity >= QUANTITY_MAX} className="flex h-6 w-6 items-center justify-center disabled:opacity-30"><QuantityPlusIcon /></button>
                            </div>
                          ) : (
                            <span className="text-body-14-sb text-[var(--color-text)]">수량 {line.quantity}개</span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard variant="order" title="주문자 정보 (비회원)" open={openSections.orderer} onToggle={() => toggleSection("orderer")}>
                <div className="grid gap-5 max-lg:grid-cols-1 lg:grid-cols-2 lg:gap-10">
                  <FormRow label="주문자명">
                    <input
                      maxLength={ORDERER_NAME_MAX_LENGTH}
                      value={ordererName}
                      onChange={(e) => setOrdererName(e.target.value)}
                      className={FORM_INPUT_CLASS}
                      placeholder="성함을 입력하세요"
                      aria-label="주문자명"
                      autoComplete="name"
                    />
                  </FormRow>
                  <FormRow label="연락처">
                    <div className="flex flex-col gap-1">
                      <input
                        value={formatPhoneNumber(ordererPhone)}
                        onChange={(e) => { setOrdererPhoneError(null); setOrdererPhone(digitsOnly(e.target.value).slice(0, 11)); }}
                        onBlur={() => { if (ordererPhone && !isValidGuestPhone(ordererPhone)) setOrdererPhoneError("올바른 전화번호 형식이 아닙니다."); }}
                        className={FORM_INPUT_CLASS}
                        placeholder="연락처를 입력하세요"
                        inputMode="numeric"
                        autoComplete="tel"
                        aria-label="주문자 연락처"
                      />
                      {ordererPhoneError && <p className="pl-1 text-body-13-m text-red-600" role="alert">{ordererPhoneError}</p>}
                    </div>
                  </FormRow>
                </div>
                <p className="mt-4 text-body-13-m text-[var(--color-text-secondary)]">
                  주문자 연락처는 주문번호와 함께 비회원 주문 조회·취소에 사용됩니다.
                </p>
              </SectionCard>

              <CheckoutAddressSection
                variant="order"
                title="배송지 정보"
                open={openSections.delivery}
                onToggle={() => toggleSection("delivery")}
                selectedAddress={null}
                onChangeAddress={() => {}}
                newAddr={receiver}
                setNewAddr={setReceiver}
                phoneError={receiverPhoneError}
                setPhoneError={setReceiverPhoneError}
                onSearchAddress={() => openAddressSearchPopup(setReceiver)}
              />

              <SectionCard variant="order" title="결제수단 선택" open={openSections.payment} onToggle={() => toggleSection("payment")}>
                <div className="flex flex-col gap-4 pb-1">
                  {widgetLoadError ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <p className="text-center text-body-13-m text-red-600" role="alert">{widgetLoadError}</p>
                      <button type="button" onClick={reloadWidget} className="rounded-[6px] border border-[var(--color-border)] px-4 py-2 text-body-13-sb text-[var(--color-text)] hover:bg-[var(--color-surface-warm)]">다시 시도</button>
                    </div>
                  ) : (
                    <>
                      <div id={PURCHASE_WIDGET_ELEMENT_ID} />
                      <div id={PURCHASE_AGREEMENT_ELEMENT_ID} />
                      {!paymentReady && <p className="text-center text-body-13-m text-[var(--color-text-secondary)]">결제 UI를 불러오는 중…</p>}
                    </>
                  )}
                  <FormRow label="쿠폰사용">
                    <div className="flex items-center gap-3 md:max-w-[328px]">
                      <input disabled value="" className={`${FORM_INPUT_CLASS} min-w-0 flex-1 cursor-not-allowed`} placeholder="비회원은 쿠폰 사용이 불가합니다." aria-label="쿠폰 코드" />
                      <button type="button" disabled className={`${FORM_ACTION_CHIP_CLASS} cursor-not-allowed opacity-40`}>쿠폰사용</button>
                    </div>
                  </FormRow>
                </div>
              </SectionCard>

              <OrderDeliveryMethodSection open={openSections.method} onToggle={() => toggleSection("method")} />
            </div>

            <div className="max-md:hidden self-stretch bg-[var(--color-text-muted)]" />

            <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-[calc(var(--header-offset)_+_24px)]">
              <PurchaseOrderSummaryCard
                open={openSections.summary}
                onToggle={() => toggleSection("summary")}
                basePrice={quote?.itemsAmount ?? 0}
                totalDiscount={quote?.couponDiscountAmount ?? 0}
                originalShippingFee={quote?.shippingFee ?? 0}
                shippingFee={quote?.shippingFee ?? 0}
                total={quote?.amount ?? 0}
                quantity={quote?.totalQuantity ?? 0}
                agreements={{
                  open: agreeOpen,
                  terms: agreeTerms,
                  privacy: agreePrivacy,
                  onTogglePanel: () => setAgreeOpen((open) => !open),
                  onToggleTerms: () => setAgreeTerms((checked) => !checked),
                  onTogglePrivacy: () => setAgreePrivacy((checked) => !checked),
                  onAgreeAll: () => { const next = !agreeAll; setAgreeTerms(next); setAgreePrivacy(next); },
                }}
                submitError={submitError ?? (isQuoting ? null : quoteError)}
                notice={minimumNotice}
                isPaying={isPaying}
                paymentReady={paymentReady && !isQuoting && !!quote && !belowMinimum}
                onPay={() => void handlePay()}
              />
              <CheckoutPromotionBanner />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
