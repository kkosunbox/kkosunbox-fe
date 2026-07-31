import { SectionCard } from "@/shared/ui";
import { formatKrwPrice } from "@/shared/lib/format";
import { PurchaseAgreementsPanel } from "./PurchaseAgreementsPanel";

interface PurchaseOrderSummaryCardProps {
  open: boolean;
  onToggle: () => void;
  basePrice: number;
  totalDiscount: number;
  originalShippingFee: number;
  shippingFee: number;
  total: number;
  agreeOpen: boolean;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeAll: boolean;
  onToggleAgreePanel: () => void;
  onToggleTerms: () => void;
  onTogglePrivacy: () => void;
  onAgreeAll: () => void;
  submitError: string | null;
  isPaying: boolean;
  paymentReady: boolean;
  onPay: () => void;
}

export function PurchaseOrderSummaryCard({
  open,
  onToggle,
  basePrice,
  totalDiscount,
  originalShippingFee,
  shippingFee,
  total,
  agreeOpen,
  agreeTerms,
  agreePrivacy,
  agreeAll,
  onToggleAgreePanel,
  onToggleTerms,
  onTogglePrivacy,
  onAgreeAll,
  submitError,
  isPaying,
  paymentReady,
  onPay,
}: PurchaseOrderSummaryCardProps) {
  return (
    <SectionCard title="결제정보" open={open} onToggle={onToggle}>
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

        <PurchaseAgreementsPanel
          agreeOpen={agreeOpen}
          agreeTerms={agreeTerms}
          agreePrivacy={agreePrivacy}
          agreeAll={agreeAll}
          onToggleAgreePanel={onToggleAgreePanel}
          onToggleTerms={onToggleTerms}
          onTogglePrivacy={onTogglePrivacy}
          onAgreeAll={onAgreeAll}
        />

        {submitError ? (
          <p className="text-body-13-m text-red-600" role="alert">
            {submitError}
          </p>
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
