import { SectionCard } from "@/shared/ui";
import { PURCHASE_WIDGET_ELEMENT_ID, PURCHASE_AGREEMENT_ELEMENT_ID } from "../purchaseOrderHelpers";

interface PurchasePaymentMethodCardProps {
  open: boolean;
  onToggle: () => void;
  widgetLoadError: string | null;
  paymentReady: boolean;
  onRetry: () => void;
}

export function PurchasePaymentMethodCard({
  open,
  onToggle,
  widgetLoadError,
  paymentReady,
  onRetry,
}: PurchasePaymentMethodCardProps) {
  return (
    <SectionCard title="결제 수단" open={open} onToggle={onToggle}>
      <div className="flex flex-col gap-4 pb-1">
        {widgetLoadError ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-center text-body-13-m text-red-600" role="alert">
              {widgetLoadError}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-[6px] border border-[var(--color-border)] px-4 py-2 text-body-13-sb text-[var(--color-text)] hover:bg-[var(--color-surface-warm)]"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div id={PURCHASE_WIDGET_ELEMENT_ID} />
            <div id={PURCHASE_AGREEMENT_ELEMENT_ID} />
            {!paymentReady ? (
              <p className="text-center text-body-13-m text-[var(--color-text-secondary)]">결제 UI를 불러오는 중…</p>
            ) : null}
          </>
        )}
      </div>
    </SectionCard>
  );
}
