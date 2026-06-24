import type { BillingInfo } from "@/features/billing/api/types";
import type { CouponInfo } from "@/features/subscription/api/types";
import { ORDER_ACTION_CHIP_CLASS as actionChipCls, ORDER_INPUT_CLASS as inputCls } from "./orderSectionStyles";
import { formatOrderPrice as formatPrice } from "./orderSectionFormatters";
import { SectionCard, RadioButton, Checkbox } from "./OrderSectionFormParts";
import { CardIcon, BillingRegisteredIcon } from "./OrderSectionIcons";

interface OrderPaymentSectionProps {
  open: boolean;
  onToggle: () => void;
  paymentMethod: string;
  billing: BillingInfo | null;
  onSelectPaymentMethod: (method: string) => void;
  onChangeCard: () => void;
  couponEnabled: boolean;
  onToggleCoupon: () => void;
  couponCodeInput: string;
  setCouponCodeInput: (value: string) => void;
  couponInfo: CouponInfo | null;
  couponError: string | null;
  couponDiscount: number;
  onApplyCoupon: () => void;
}

export function OrderPaymentSection({
  open,
  onToggle,
  paymentMethod,
  billing,
  onSelectPaymentMethod,
  onChangeCard,
  couponEnabled,
  onToggleCoupon,
  couponCodeInput,
  setCouponCodeInput,
  couponInfo,
  couponError,
  couponDiscount,
  onApplyCoupon,
}: OrderPaymentSectionProps) {
  return (
    <SectionCard title="결제수단 선택" open={open} onToggle={onToggle}>
      <div className="flex flex-col gap-4">
        {/* 결제 수단 라디오 + 카드 정보 — 같은 행 */}
        <div className="flex items-center gap-4 flex-wrap">
          {["신용카드" /* TODO: "카카오페이", "무통장입금", "계좌이체" — 추후 지원 예정 */].map((method) => (
            <RadioButton
              key={method}
              checked={paymentMethod === method}
              onChange={() => onSelectPaymentMethod(method)}
              label={method}
            />
          ))}
          {/* 등록된 카드 정보 표시 + 카드 변경 버튼 */}
          {paymentMethod === "신용카드" && billing && (
            <>
              <div className="flex items-center gap-3">
                <CardIcon />
                <span className="text-body-13-m text-[var(--color-text)]">
                  {billing.cardCompany} **** {billing.lastFourDigits}
                </span>
                <BillingRegisteredIcon />
              </div>
              <button
                type="button"
                onClick={onChangeCard}
                className={`${actionChipCls} ml-auto`}
              >
                카드 변경
              </button>
            </>
          )}
        </div>

        {/* 쿠폰 사용 */}
        <div className="flex flex-col gap-3 pt-4">
          <Checkbox
            checked={couponEnabled}
            onChange={onToggleCoupon}
            label="쿠폰사용"
          />
          {couponEnabled && (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-0 md:items-center md:gap-4">
                <span className="shrink-0 pt-3 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px] md:pt-0">
                  쿠폰입력
                </span>
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <input
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className={`${inputCls} flex-1 min-w-0`}
                    placeholder="코드 입력"
                  />
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    className={actionChipCls}
                  >
                    쿠폰적용
                  </button>
                </div>
                {couponInfo?.canUse ? (
                  <span className="shrink-0 text-body-13-m text-[var(--color-text-secondary)]">
                    {couponInfo.name ?? `할인쿠폰`} {couponInfo.discountRate}% -{formatPrice(couponDiscount)}
                  </span>
                ) : null}
              </div>
              {couponError ? (
                <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]">{couponError}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
