import { SectionCard, Checkbox, FORM_ACTION_CHIP_CLASS as actionChipCls, FORM_INPUT_CLASS as inputCls } from "@/shared/ui";
import { formatKrwPrice } from "@/shared/lib/format";
import type { ProductCouponInfo } from "@/features/product/api/types";

interface PurchaseCouponCardProps {
  open: boolean;
  onToggle: () => void;
  couponEnabled: boolean;
  onToggleCoupon: () => void;
  couponCodeInput: string;
  setCouponCodeInput: (value: string) => void;
  couponInfo: ProductCouponInfo | null;
  couponError: string | null;
  couponDiscount: number;
  onApplyCoupon: () => void;
}

export function PurchaseCouponCard({
  open,
  onToggle,
  couponEnabled,
  onToggleCoupon,
  couponCodeInput,
  setCouponCodeInput,
  couponInfo,
  couponError,
  couponDiscount,
  onApplyCoupon,
}: PurchaseCouponCardProps) {
  return (
    <SectionCard title="쿠폰 입력" open={open} onToggle={onToggle}>
      <div className="flex flex-col gap-3">
        <Checkbox checked={couponEnabled} onChange={onToggleCoupon} label="쿠폰사용" />
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
                  className={`${inputCls} min-w-0 flex-1`}
                  placeholder="코드 입력"
                  aria-label="쿠폰 코드"
                />
                <button type="button" onClick={onApplyCoupon} className={actionChipCls}>
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
  );
}
