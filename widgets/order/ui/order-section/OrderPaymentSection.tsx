import type { BillingInfo } from "@/features/billing/api/types";
import { getCardName, getLastFourDigits } from "@/features/billing/lib/formatBillingLabel";
import type { CouponInfo } from "@/features/subscription/api/types";
import {
  FORM_ACTION_CHIP_CLASS as actionChipCls,
  FORM_ACTION_CHIP_SMALL_CLASS as actionChipSmallCls,
  FORM_INPUT_CLASS as inputCls,
  SectionCard,
  RadioButton,
  Checkbox,
} from "@/shared/ui";
import { formatKrwPrice as formatPrice } from "@/shared/lib/format";
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
    <SectionCard variant="order" title="결제수단 선택" open={open} onToggle={onToggle}>
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
          {/* 카드 등록 여부에 따라 분기: 미등록 시 등록 버튼, 등록 시 카드 정보 + 변경 버튼 */}
          {paymentMethod === "신용카드" &&
            (billing ? (
              <>
                <div className="flex items-center gap-3">
                  <CardIcon />
                  <span className="text-body-13-m text-[var(--color-text)]">
                    {getCardName(billing)} **** {getLastFourDigits(billing)}
                  </span>
                  <BillingRegisteredIcon />
                </div>
                <button
                  type="button"
                  onClick={onChangeCard}
                  className={actionChipSmallCls}
                >
                  카드 변경
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onChangeCard}
                className={actionChipCls}
              >
                카드 등록
              </button>
            ))}
        </div>

        {/* 쿠폰 사용 */}
        <div className="flex items-start gap-3 pt-2">
          <div className="shrink-0 pt-2.5">
            <Checkbox
              checked={couponEnabled}
              onChange={onToggleCoupon}
              label="쿠폰사용"
            />
          </div>
          {couponEnabled && (
            <div className="flex min-w-0 flex-1 flex-col gap-2 md:max-w-[328px]">
              <div className="flex items-start gap-0 md:items-center">
                <div className="flex flex-1 items-center gap-3 min-w-0 md:max-w-[328px]">
                  <input
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    maxLength={30} // 백엔드 스펙: 쿠폰 코드 최대 30자
                    className={`${inputCls} flex-1 min-w-0`}
                    placeholder="쿠폰번호를 입력하세요"
                    aria-label="쿠폰 코드"
                  />
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    className={actionChipCls}
                  >
                    쿠폰적용
                  </button>
                </div>
              </div>
              {/* 적용된 쿠폰 정보는 입력 줄 오른쪽이 아니라 아랫줄에 둔다 — 같은 줄에 두면 쿠폰명 길이만큼
                  입력창이 밀려 좁아지고, 에러 메시지와 노출 위치도 어긋난다. */}
              {couponInfo?.canUse ? (
                <p className="text-body-13-m text-[var(--color-text-secondary)]">
                  {couponInfo.name ?? `할인쿠폰`} -{formatPrice(couponDiscount)}
                </p>
              ) : null}
              {couponError ? (
                <p className="text-body-13-m text-red-600">{couponError}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
