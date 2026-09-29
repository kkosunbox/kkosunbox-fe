import { Checkbox, SectionCard, FORM_ACTION_CHIP_CLASS as actionChipCls, FORM_INPUT_CLASS as inputCls } from "@/shared/ui";
import { formatKrwPrice } from "@/shared/lib/format";
import type { ProductCouponInfo } from "@/features/product/api/types";
import { PURCHASE_WIDGET_ELEMENT_ID, PURCHASE_AGREEMENT_ELEMENT_ID } from "../purchaseOrderHelpers";

interface PurchasePaymentMethodCardProps {
  open: boolean;
  onToggle: () => void;
  widgetLoadError: string | null;
  paymentReady: boolean;
  onRetry: () => void;
  couponCodeInput: string;
  setCouponCodeInput: (value: string) => void;
  couponEnabled: boolean;
  onToggleCoupon: () => void;
  couponInfo: ProductCouponInfo | null;
  couponError: string | null;
  couponDiscount: number;
  onApplyCoupon: () => void;
}

export function PurchasePaymentMethodCard({
  open,
  onToggle,
  widgetLoadError,
  paymentReady,
  onRetry,
  couponCodeInput,
  setCouponCodeInput,
  couponEnabled,
  onToggleCoupon,
  couponInfo,
  couponError,
  couponDiscount,
  onApplyCoupon,
}: PurchasePaymentMethodCardProps) {
  return (
    <SectionCard variant="order" title="결제수단 선택" open={open} onToggle={onToggle}>
      <div className="flex flex-col pb-1">
        <div className="flex flex-col gap-4">
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
        <div className="mt-6 flex items-start gap-3">
          <div className="shrink-0 pt-2.5"><Checkbox checked={couponEnabled} onChange={onToggleCoupon} label="쿠폰사용" /></div>
          {couponEnabled && (
            <div className="flex min-w-0 flex-1 flex-col gap-2 md:max-w-[328px]">
              <div className="flex items-start gap-0 md:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <input
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    maxLength={30}
                    className={`${inputCls} min-w-0 flex-1`}
                    placeholder="쿠폰번호를 입력하세요"
                    aria-label="쿠폰 코드"
                  />
                  <button type="button" onClick={onApplyCoupon} className={actionChipCls}>
                    쿠폰적용
                  </button>
                </div>
              </div>
              {couponInfo?.canUse ? (
                <p className="text-body-13-m text-[var(--color-text-secondary)]">
                  {couponInfo.name ?? "할인쿠폰"} -{formatKrwPrice(couponDiscount)}
                </p>
              ) : null}
              {couponError ? (
                <p className="text-body-13-m text-red-600" role="alert">
                  {couponError}
                </p>
              ) : null}
            </div>
          )}
        </div>


      </div>
    </SectionCard>
  );
}
