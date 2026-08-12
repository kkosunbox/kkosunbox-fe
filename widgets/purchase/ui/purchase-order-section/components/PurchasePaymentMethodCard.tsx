import { SectionCard, FORM_ACTION_CHIP_CLASS as actionChipCls, FORM_INPUT_CLASS as inputCls } from "@/shared/ui";
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
  couponInfo,
  couponError,
  couponDiscount,
  onApplyCoupon,
}: PurchasePaymentMethodCardProps) {
  return (
    <SectionCard title="결제수단 선택" open={open} onToggle={onToggle}>
      <div className="flex flex-col pb-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-0 md:items-center md:gap-4">
            <span className="shrink-0 pt-3 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px] md:pt-0">
              쿠폰사용
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <input
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                maxLength={30} // 백엔드 스펙: 쿠폰 코드 최대 30자
                className={`${inputCls} min-w-0 flex-1`}
                placeholder="쿠폰을 입력해주세요."
                aria-label="쿠폰 코드"
              />
              <button type="button" onClick={onApplyCoupon} className={actionChipCls}>
                쿠폰적용
              </button>
            </div>
          </div>
          {/* 적용된 쿠폰 정보는 입력 줄 오른쪽이 아니라 아랫줄에 둔다 — 같은 줄에 두면 쿠폰명 길이만큼
              입력창이 밀려 좁아지고, 에러 메시지와 노출 위치도 어긋난다.
              할인율은 따로 적지 않는다 — 쿠폰명에 이미 들어 있어(예: "웰컴 10%") 두 번 노출된다. */}
          {couponInfo?.canUse ? (
            <p className="text-body-13-m text-[var(--color-text-secondary)] max-md:pl-[82px] md:pl-[86px]">
              {couponInfo.name ?? "할인쿠폰"} -{formatKrwPrice(couponDiscount)}
            </p>
          ) : null}
          {couponError ? (
            <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]" role="alert">
              {couponError}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-4">
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
              <p className="pl-[30px] text-subtitle-16-b-tight text-[var(--color-text)]">결제 방법</p>
              <div id={PURCHASE_WIDGET_ELEMENT_ID} />
              <div id={PURCHASE_AGREEMENT_ELEMENT_ID} />
              {!paymentReady ? (
                <p className="text-center text-body-13-m text-[var(--color-text-secondary)]">결제 UI를 불러오는 중…</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
