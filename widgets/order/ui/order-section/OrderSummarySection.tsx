import { formatKrwPrice as formatPrice } from "@/shared/lib/format";
import { SectionCard, Checkbox, CollapsiblePanel } from "./OrderSectionFormParts";
import { ChevronIcon } from "./OrderSectionIcons";

interface OrderSummarySectionProps {
  open: boolean;
  onToggle: () => void;
  quantity: number;
  basePrice: number;
  totalDiscount: number;
  total: number;
  agreeOpen: boolean;
  onToggleAgreePanel: () => void;
  agreeTerms: boolean;
  onToggleTerms: () => void;
  agreePrivacy: boolean;
  onTogglePrivacy: () => void;
  agreeAge: boolean;
  onToggleAge: () => void;
  agreeAll: boolean;
  handleAgreeAll: () => void;
  submitError: string | null;
  isPending: boolean;
  handlePay: () => void;
}

export function OrderSummarySection({
  open,
  onToggle,
  quantity,
  basePrice,
  totalDiscount,
  total,
  agreeOpen,
  onToggleAgreePanel,
  agreeTerms,
  onToggleTerms,
  agreePrivacy,
  onTogglePrivacy,
  agreeAge,
  onToggleAge,
  agreeAll,
  handleAgreeAll,
  submitError,
  isPending,
  handlePay,
}: OrderSummarySectionProps) {
  return (
    <SectionCard title="결제정보" open={open} onToggle={onToggle}>
      <div className="flex flex-col max-md:gap-4 md:gap-8">
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
            <div className="flex justify-between items-center">
              <span className="text-body-13-m text-[var(--color-text)]">총 배송비</span>
              <span className="text-body-13-m text-[var(--color-text)]">-0원</span>
            </div>
          </div>

          <div className="border-t border-[var(--color-border-light)]" />

          <div className="flex justify-between items-center">
            <span className="text-body-14-b text-[var(--color-text)]">월 요금제</span>
            <span className="text-price-20-eb text-[var(--color-text)]">{formatPrice(total)}</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Checkbox checked={agreeAll} onChange={handleAgreeAll} label="모두 동의합니다." />
              <button
                type="button"
                aria-label={agreeOpen ? "약관 항목 접기" : "약관 항목 펼치기"}
                onClick={onToggleAgreePanel}
                aria-expanded={agreeOpen}
                aria-controls="order-agreements-panel"
              >
                <ChevronIcon open={agreeOpen} size={20} />
              </button>
            </div>
            <CollapsiblePanel
              id="order-agreements-panel"
              open={agreeOpen}
              className="mt-3"
              innerClassName="flex flex-col gap-2.5 border-t border-[var(--color-border-light)] pt-3 pl-1"
            >
                <Checkbox
                  checked={agreeTerms}
                  onChange={onToggleTerms}
                  label="이용약관 동의 (필수)"
                />
                <Checkbox
                  checked={agreePrivacy}
                  onChange={onTogglePrivacy}
                  label="개인정보 수집·이용 동의 (필수)"
                />
                <Checkbox
                  checked={agreeAge}
                  onChange={onToggleAge}
                  label="만 14세 이상 확인 (필수)"
                />
            </CollapsiblePanel>
          </div>

          {submitError ? (
            <p className="text-body-13-m text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <button
            type="button"
            disabled={!agreeAll || isPending}
            onClick={handlePay}
            className="w-full h-12 rounded-[8px] bg-[var(--color-cta-button)] text-white text-body-16-sb tracking-[-0.02em] disabled:opacity-50"
          >
            {isPending ? "처리 중…" : "결제하기"}
          </button>
      </div>
    </SectionCard>
  );
}
