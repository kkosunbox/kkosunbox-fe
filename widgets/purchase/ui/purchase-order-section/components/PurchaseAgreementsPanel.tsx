import { Checkbox, CollapsiblePanel, ChevronIcon } from "@/shared/ui";
import { PURCHASE_AGREEMENTS_PANEL_ID } from "../purchaseOrderHelpers";

interface PurchaseAgreementsPanelProps {
  agreeOpen: boolean;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeAll: boolean;
  onToggleAgreePanel: () => void;
  onToggleTerms: () => void;
  onTogglePrivacy: () => void;
  onAgreeAll: () => void;
}

export function PurchaseAgreementsPanel({
  agreeOpen,
  agreeTerms,
  agreePrivacy,
  agreeAll,
  onToggleAgreePanel,
  onToggleTerms,
  onTogglePrivacy,
  onAgreeAll,
}: PurchaseAgreementsPanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Checkbox checked={agreeAll} onChange={onAgreeAll} label="모두 동의합니다." />
        <button
          type="button"
          aria-label={agreeOpen ? "약관 항목 접기" : "약관 항목 펼치기"}
          onClick={onToggleAgreePanel}
          aria-expanded={agreeOpen}
          aria-controls={PURCHASE_AGREEMENTS_PANEL_ID}
        >
          <ChevronIcon open={agreeOpen} size={20} />
        </button>
      </div>
      <CollapsiblePanel
        id={PURCHASE_AGREEMENTS_PANEL_ID}
        open={agreeOpen}
        className="mt-3"
        innerClassName="flex flex-col gap-2.5 border-t border-[var(--color-border-light)] pt-3 pl-1"
      >
        <Checkbox
          checked={agreeTerms}
          onChange={onToggleTerms}
          label={
            <span className="inline-flex items-center gap-1.5">
              이용약관 동의 (필수)
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-secondary)] underline"
              >
                보기
              </a>
            </span>
          }
        />
        <Checkbox
          checked={agreePrivacy}
          onChange={onTogglePrivacy}
          label={
            <span className="inline-flex items-center gap-1.5">
              개인정보 수집·이용 동의 (필수)
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-secondary)] underline"
              >
                보기
              </a>
            </span>
          }
        />
      </CollapsiblePanel>
    </div>
  );
}
