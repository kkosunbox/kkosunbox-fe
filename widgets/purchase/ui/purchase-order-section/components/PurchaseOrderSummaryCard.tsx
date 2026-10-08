import { SectionCard } from "@/shared/ui";
import { formatKrwPrice } from "@/shared/lib/format";
import { PurchaseAgreementsPanel, type PurchaseAgreements } from "./PurchaseAgreementsPanel";

interface PurchaseOrderSummaryCardProps {
  open: boolean;
  onToggle: () => void;
  basePrice: number;
  totalDiscount: number;
  originalShippingFee: number;
  shippingFee: number;
  total: number;
  quantity: number;
  /** 비회원 주문처럼 명시적 약관 동의가 필요할 때만 전달 — 생략하면 안내 문구만 표시 */
  agreements?: PurchaseAgreements;
  submitError: string | null;
  isPaying: boolean;
  paymentReady: boolean;
  onPay: () => void;
  /** 결제 버튼 위 안내 (예: 최소 주문 금액 미달) — submitError가 없을 때만 표시 */
  notice?: string | null;
}

export function PurchaseOrderSummaryCard({
  open,
  onToggle,
  basePrice,
  totalDiscount,
  originalShippingFee,
  shippingFee,
  total,
  quantity,
  agreements,
  submitError,
  isPaying,
  paymentReady,
  onPay,
  notice,
}: PurchaseOrderSummaryCardProps) {
  return (
    <SectionCard variant="order" title="결제정보" open={open} onToggle={onToggle}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col max-md:gap-4 md:gap-4">
          <div className="flex items-center justify-between">
            <span className="text-body-13-m text-[var(--color-text)]">주문상품금액{quantity > 1 ? ` ×${quantity}` : ""}</span>
            <span className="text-body-13-m text-[var(--color-text)]">{formatKrwPrice(basePrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-13-m text-[var(--color-text)]">총 할인금액</span>
            <span className="text-body-13-m text-[var(--color-text)]">-{formatKrwPrice(totalDiscount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-13-m text-[var(--color-text)]">총 배송비</span>
            {originalShippingFee > shippingFee ? (
              <span className="inline-flex items-center gap-1 text-body-13-m text-[var(--color-text)]">
                <span className="text-[var(--color-text-secondary)] line-through">{formatKrwPrice(originalShippingFee)}</span>
                {formatKrwPrice(shippingFee)}
              </span>
            ) : (
              <span className="text-body-13-m text-[var(--color-text)]">
                {formatKrwPrice(shippingFee)}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--color-border-light)]" />

        <div className="flex items-center justify-between">
          <span className="text-body-14-b text-[var(--color-text)]">총 주문금액</span>
          <span className="text-price-20-eb text-[var(--color-text)]">{formatKrwPrice(total)}</span>
        </div>

        <PurchaseAgreementsPanel agreements={agreements} />

        {submitError ? (
          <p className="text-body-13-m text-red-600" role="alert">
            {submitError}
          </p>
        ) : notice ? (
          <p className="text-body-13-m text-[var(--color-text-secondary)]">{notice}</p>
        ) : null}

        <button
          type="button"
          onClick={onPay}
          disabled={!paymentReady || isPaying}
          className="mt-1 flex h-12 w-full items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
        >
          {isPaying ? "결제 요청 중…" : "결제하기"}
        </button>
      </div>
    </SectionCard>
  );
}
