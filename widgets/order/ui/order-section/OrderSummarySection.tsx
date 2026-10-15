import { formatKrwPrice as formatPrice } from "@/shared/lib/format";
import { SectionCard, ShippingFeeWaiver } from "@/shared/ui";

interface OrderSummarySectionProps {
  open: boolean;
  onToggle: () => void;
  quantity: number;
  basePrice: number;
  /** 초대 할인액 — 첫 결제 1회만 적용된다. 0이면 초대 혜택 안내를 숨긴다 */
  referralDiscount: number;
  totalDiscount: number;
  total: number;
  submitError: string | null;
  isPending: boolean;
  isQuoting: boolean;
  hasBilling: boolean;
  handlePay: () => void;
}

export function OrderSummarySection({
  open,
  onToggle,
  quantity,
  basePrice,
  referralDiscount,
  totalDiscount,
  total,
  submitError,
  isPending,
  isQuoting,
  hasBilling,
  handlePay,
}: OrderSummarySectionProps) {
  const hasFirstMonthReferral = referralDiscount > 0;

  return (
    <SectionCard variant="order" title="결제정보" open={open} onToggle={onToggle}>
      <div className="flex flex-col gap-5">
          <div className="flex flex-col max-md:gap-4 md:gap-4">
            <div className="flex justify-between items-center">
              <span className="text-body-13-m text-[var(--color-text)]">
                주문상품금액{quantity > 1 ? ` ×${quantity}` : ""}
              </span>
              <span className="text-body-13-m text-[var(--color-text)]">{formatPrice(basePrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-13-m text-[var(--color-text)]">총 할인금액</span>
              <span className="text-body-13-m text-[var(--color-text)]">
                -{formatPrice(totalDiscount)}
              </span>
            </div>
            {hasFirstMonthReferral && (
              <div className="-mt-2 flex justify-between items-center pl-2">
                <span className="text-body-13-m text-[var(--color-text-secondary)]">ㄴ 초대 혜택 (첫 달 한정)</span>
                <span className="text-body-13-m text-[var(--color-referral-offer-price)]">
                  -{formatPrice(referralDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-body-13-m text-[var(--color-text)]">총 배송비</span>
              <ShippingFeeWaiver className="text-[var(--color-text)]" />
            </div>
          </div>

          <div className="border-t border-[var(--color-border-light)]" />

          <div className="flex justify-between items-center">
            <span className="text-body-14-b text-[var(--color-text)]">결제 금액</span>
            <span className="text-price-20-eb text-[var(--color-text)]">{formatPrice(total)}</span>
          </div>

          <p className="text-body-13-m text-[var(--color-text)] opacity-80">
            약관 및 주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.
          </p>

          {!hasBilling ? (
            <p className="text-body-13-m text-[var(--color-text-secondary)]" role="status">
              결제 수단을 등록해야 결제할 수 있어요.
            </p>
          ) : null}

          {submitError ? (
            <p className="text-body-13-m text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <button
            type="button"
            disabled={isPending || isQuoting || !hasBilling}
            onClick={handlePay}
            className="w-full h-12 rounded-[8px] bg-[var(--color-cta-button)] text-white text-body-16-sb tracking-[-0.02em] disabled:opacity-50"
          >
            {isPending ? "처리 중…" : "구독하기"}
          </button>
      </div>
    </SectionCard>
  );
}
