import { Checkbox, CollapsiblePanel, ChevronIcon } from "@/shared/ui";

const AGREEMENTS_PANEL_ID = "purchase-agreements-panel";
const AGREEMENT_NOTICE = "약관 및 주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.";

/** 명시적 약관 동의가 필요한 주문(비회원)에서만 전달한다 */
export interface PurchaseAgreements {
  open: boolean;
  terms: boolean;
  privacy: boolean;
  onTogglePanel: () => void;
  onToggleTerms: () => void;
  onTogglePrivacy: () => void;
  onAgreeAll: () => void;
}

/**
 * agreements가 없으면 결제 버튼 클릭으로 동의한 것으로 간주하고 안내 문구만 표시한다 (회원 주문).
 * agreements가 있으면 체크박스로 명시적 동의를 받는다 (비회원 주문).
 */
export function PurchaseAgreementsPanel({ agreements }: { agreements?: PurchaseAgreements }) {
  if (!agreements) {
    return <p className="text-body-13-m text-[var(--color-text)] opacity-80">{AGREEMENT_NOTICE}</p>;
  }

  const { open, terms, privacy, onTogglePanel, onToggleTerms, onTogglePrivacy, onAgreeAll } = agreements;
  return (
    <div>
      <div className="flex items-center justify-between">
        <Checkbox checked={terms && privacy} onChange={onAgreeAll} label={AGREEMENT_NOTICE} />
        <button
          type="button"
          aria-label={open ? "약관 항목 접기" : "약관 항목 펼치기"}
          onClick={onTogglePanel}
          aria-expanded={open}
          aria-controls={AGREEMENTS_PANEL_ID}
        >
          <ChevronIcon open={open} size={20} />
        </button>
      </div>
      <CollapsiblePanel
        id={AGREEMENTS_PANEL_ID}
        open={open}
        className="mt-3"
        innerClassName="flex flex-col gap-2.5 border-t border-[var(--color-border-light)] pt-3 pl-1"
      >
        <Checkbox
          checked={terms}
          onChange={onToggleTerms}
          label={
            <span className="inline-flex items-center gap-1.5">
              이용약관 동의 (필수)
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-secondary)] underline">
                보기
              </a>
            </span>
          }
        />
        <Checkbox
          checked={privacy}
          onChange={onTogglePrivacy}
          label={
            <span className="inline-flex items-center gap-1.5">
              개인정보 수집·이용 동의 (필수)
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-secondary)] underline">
                보기
              </a>
            </span>
          }
        />
      </CollapsiblePanel>
    </div>
  );
}
