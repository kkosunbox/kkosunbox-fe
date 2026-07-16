import type { InviteSectionMode } from "@/features/order";
import {
  FORM_ACTION_CHIP_CLASS as actionChipCls,
  FORM_INPUT_CLASS as inputCls,
  SectionCard,
} from "@/shared/ui";

interface OrderInviteSectionProps {
  open: boolean;
  onToggle: () => void;
  inviteSectionMode: Exclude<InviteSectionMode, "hidden">;
  inviteCodeInput: string;
  onInviteCodeChange: (value: string) => void;
  inviteStatus: "idle" | "loading" | "applicable" | "blocked" | "networkError";
  inviteBlockedMsg: string | null;
  isInviteInputLocked: boolean;
  onApplyInviteCode: () => void;
  onRetryInviteValidation: () => void;
  onDismissStoredInviteCode: () => void;
}

export function OrderInviteSection({
  open,
  onToggle,
  inviteSectionMode,
  inviteCodeInput,
  onInviteCodeChange,
  inviteStatus,
  inviteBlockedMsg,
  isInviteInputLocked,
  onApplyInviteCode,
  onRetryInviteValidation,
  onDismissStoredInviteCode,
}: OrderInviteSectionProps) {
  return (
    <SectionCard title="초대코드 입력" open={open} onToggle={onToggle}>
      {inviteSectionMode === "ineligible" ? (
        // 초대링크 진입 + 구독 이력 있음 → 입력 필드 없이 안내 문구만 노출
        <p className="text-body-13-m text-[var(--color-text-secondary)]">
          초대코드는 첫 구독 시에만 사용 가능합니다.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 md:gap-4">
            <span className="shrink-0 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px]">
              코드입력
            </span>
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <input
                value={inviteCodeInput}
                onChange={(e) => onInviteCodeChange(e.target.value)}
                disabled={isInviteInputLocked}
                className={`${inputCls} flex-1 min-w-0 disabled:cursor-not-allowed disabled:opacity-60`}
                placeholder="초대코드를 입력해주세요."
                aria-label="초대코드"
              />
              <button
                type="button"
                onClick={onApplyInviteCode}
                disabled={isInviteInputLocked || inviteStatus === "loading"}
                className={`${actionChipCls} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                코드적용
              </button>
            </div>
          </div>
          {isInviteInputLocked && inviteStatus === "loading" && (
            <p className="text-body-13-m text-[var(--color-text-secondary)] max-md:pl-[82px] md:pl-[86px]">
              초대코드 적용 확인 중…
            </p>
          )}
          {inviteStatus === "blocked" && (
            <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]">
              {inviteBlockedMsg ?? "첫 구독 시에만 사용 가능합니다."}
            </p>
          )}
          {inviteStatus === "networkError" && (
            <p className="text-body-13-m text-red-600 max-md:pl-[82px] md:pl-[86px]">
              초대코드 확인에 실패했습니다.
            </p>
          )}
          {isInviteInputLocked &&
            (inviteStatus === "blocked" || inviteStatus === "networkError") && (
              <div className="flex flex-wrap items-center gap-3 max-md:pl-[82px] md:pl-[86px]">
                {inviteStatus === "networkError" && (
                  <button
                    type="button"
                    onClick={onRetryInviteValidation}
                    className="text-body-13-m text-[var(--color-accent)] underline"
                  >
                    다시 시도
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDismissStoredInviteCode}
                  className="text-body-13-m text-[var(--color-accent)] underline"
                >
                  코드 삭제
                </button>
              </div>
            )}
        </div>
      )}
    </SectionCard>
  );
}
