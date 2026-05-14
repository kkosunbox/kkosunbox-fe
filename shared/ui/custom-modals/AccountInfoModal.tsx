"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { changePassword } from "@/features/auth/api";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { useLoadingOverlay, useModal } from "@/shared/ui";

type View = "info" | "password-change";

interface Props {
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 1.5L1.5 12.5" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M1.5 1.5L12.5 12.5" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
    </svg>
  );
}

function PasswordField({ id, value, onChange, placeholder, autoComplete, visible, onToggleVisible }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  return (
    <div className="relative flex h-8 flex-1 items-center rounded-[4px] bg-white">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-full w-full rounded-[4px] bg-transparent pl-3 pr-9 text-body-13-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
      />
      <button
        type="button"
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
        aria-pressed={visible}
        onClick={onToggleVisible}
        className="absolute right-2 inline-flex h-5 w-5 items-center justify-center"
      >
        {visible ? <EyeIcon /> : <EyeOffIcon />}
      </button>
    </div>
  );
}

/* 두 뷰에서 공통으로 쓰는 바닥 버튼 쌍 */
function FooterButtons({ leftLabel, rightLabel, onLeft, onRight, rightDisabled }: {
  leftLabel: string;
  rightLabel: string;
  onLeft: () => void;
  onRight: () => void;
  rightDisabled?: boolean;
}) {
  return (
    <div className="mt-7 flex gap-3">
      <button
        type="button"
        onClick={onLeft}
        className="h-12 flex-1 rounded-full bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80"
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={onRight}
        disabled={rightDisabled}
        className="h-12 flex-1 rounded-full bg-[var(--color-accent)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {rightLabel}
      </button>
    </div>
  );
}

export default function AccountInfoModal({ onClose }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [view, setView] = useState<View>("info");

  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function resetPasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  function validate() {
    if (!currentPassword.trim()) return "현재 비밀번호를 입력해주세요.";
    if (!newPassword.trim()) return "새 비밀번호를 입력해주세요.";
    if (newPassword.length < 8) return "새 비밀번호는 최소 8자 이상이어야 합니다.";
    if (newPassword !== confirmPassword) return "새 비밀번호가 일치하지 않습니다.";
    if (currentPassword === newPassword) return "새 비밀번호를 기존 비밀번호와 다르게 입력해주세요.";
    return null;
  }

  function handlePasswordChange() {
    const err = validate();
    if (err) { setErrorMessage(err); return; }
    setErrorMessage(null);
    showLoading("비밀번호를 변경하고 있습니다...");
    startTransition(async () => {
      try {
        await changePassword({ currentPassword, newPassword });
        // openAlert가 active=null로 이 모달을 닫고 알림을 표시
        openAlert({ type: "success", title: "비밀번호가 변경되었습니다." });
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "비밀번호 변경에 실패했습니다. 다시 시도해주세요."));
      } finally {
        hideLoading();
      }
    });
  }

  const backdrop = <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />;

  const card = "relative z-10 w-full max-w-[416px] rounded-[24px] bg-white p-7 shadow-[0px_6px_20px_rgba(78,78,78,0.8)]";

  if (view === "info") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="계정 정보">
        {backdrop}
        <div className={card}>
          {/* 헤더 */}
          <div className="relative flex h-6 items-center">
            <h2 className="text-[16px] font-bold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">계정 정보</h2>
            <button onClick={onClose} aria-label="닫기" className="absolute right-0 flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70">
              <CloseIcon />
            </button>
          </div>

          {/* 콘텐츠 박스 */}
          <div className="mt-3 rounded-[20px] bg-[var(--color-background)] px-7 py-6 md:min-h-[246px]">
            <div className="flex flex-col gap-4">
              {/* 이메일 행 */}
              <div className="flex items-center">
                <span className="w-[91px] shrink-0 text-body-13-m text-[var(--color-text)]">이메일</span>
                <div className="flex h-8 flex-1 items-center rounded-[4px] bg-white px-3">
                  <span className="truncate text-body-13-m text-[var(--color-text)]">{user?.email ?? ""}</span>
                </div>
              </div>

              {/* 비밀번호 행 */}
              <div className="flex items-center">
                <span className="w-[91px] shrink-0 text-body-13-m text-[var(--color-text)]">비밀번호</span>
                <button
                  type="button"
                  onClick={() => setView("password-change")}
                  className="h-8 w-[87px] rounded-[4px] bg-[var(--color-accent)] text-[13px] font-medium leading-[16px] text-white transition-opacity hover:opacity-90"
                >
                  비밀번호 변경
                </button>
              </div>
            </div>

            {/* 계정 탈퇴 링크 */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => { onClose(); router.push("/mypage/withdraw"); }}
                className="text-[14px] font-medium leading-[140%] tracking-[-0.02em] text-[var(--color-accent)] underline hover:opacity-70 transition-opacity"
              >
                계정 탈퇴
              </button>
            </div>
          </div>

          <FooterButtons
            leftLabel="취소"
            rightLabel="확인"
            onLeft={onClose}
            onRight={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="비밀번호 변경">
      {backdrop}
      <div className={card}>
        {/* 헤더 */}
        <div className="relative flex h-6 items-center">
          <button
            type="button"
            onClick={() => { resetPasswordForm(); setView("info"); }}
            aria-label="뒤로가기"
            className="mr-1 flex h-6 w-6 items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
          >
            <BackIcon />
          </button>
          <h2 className="text-[16px] font-bold leading-[19px] tracking-[-0.04em] text-[var(--color-text)]">비밀번호 변경</h2>
          <button onClick={onClose} aria-label="닫기" className="absolute right-0 flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70">
            <CloseIcon />
          </button>
        </div>

        {/* 콘텐츠 박스 */}
        <div className="mt-3 rounded-[20px] bg-[var(--color-background)] px-7 py-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <label htmlFor="modal-current-pw" className="w-[91px] shrink-0 text-body-13-m text-[var(--color-text)]">현재 비밀번호</label>
              <PasswordField
                id="modal-current-pw"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="비밀번호를 입력해주세요"
                autoComplete="current-password"
                visible={showCurrent}
                onToggleVisible={() => setShowCurrent((p) => !p)}
              />
            </div>

            <div className="flex items-center">
              <label htmlFor="modal-new-pw" className="w-[91px] shrink-0 text-body-13-m text-[var(--color-text)]">새 비밀번호</label>
              <PasswordField
                id="modal-new-pw"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="비밀번호를 다시 입력해주세요"
                autoComplete="new-password"
                visible={showNew}
                onToggleVisible={() => setShowNew((p) => !p)}
              />
            </div>

            <div className="pl-[91px]">
              <p className="text-[12px] font-medium leading-[16px] text-[var(--color-text-secondary)]">
                * 비밀번호는 최소 8자 이상이어야 합니다.<br />
                * 대문자, 소문자, 숫자, 특수문자를 모두 포함하여 입력해 주세요.
              </p>
            </div>

            <div className="flex items-center">
              <label htmlFor="modal-confirm-pw" className="w-[91px] shrink-0 text-body-13-m text-[var(--color-text)]">비밀번호 확인</label>
              <PasswordField
                id="modal-confirm-pw"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="비밀번호를 입력해주세요"
                autoComplete="new-password"
                visible={showConfirm}
                onToggleVisible={() => setShowConfirm((p) => !p)}
              />
            </div>
          </div>

          {errorMessage && (
            <p className="mt-4 text-center text-body-13-m text-[var(--color-accent-rust)]">{errorMessage}</p>
          )}
        </div>

        <FooterButtons
          leftLabel="취소"
          rightLabel={isPending ? "변경 중..." : "비밀번호 변경"}
          onLeft={() => { resetPasswordForm(); setView("info"); }}
          onRight={handlePasswordChange}
          rightDisabled={isPending}
        />
      </div>
    </div>
  );
}
