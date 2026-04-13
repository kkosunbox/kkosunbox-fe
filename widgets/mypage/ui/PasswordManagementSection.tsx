"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { changePassword } from "@/features/auth/api";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { useLoadingOverlay, useModal } from "@/shared/ui";

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5L7 12l8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <input
      id={id}
      type="password"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="h-11 w-full rounded-[8px] border border-[var(--color-divider-warm)] bg-white px-4 text-body-14-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-placeholder)]"
    />
  );
}

export default function PasswordManagementSection() {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function validate() {
    if (!currentPassword.trim()) return "현재 비밀번호를 입력해주세요.";
    if (!newPassword.trim()) return "새 비밀번호를 입력해주세요.";
    if (newPassword.length < 8) return "새 비밀번호는 최소 8자 이상이어야 합니다.";
    if (newPassword !== confirmPassword) return "새 비밀번호가 일치하지 않습니다.";
    if (currentPassword === newPassword) return "새 비밀번호를 기존 비밀번호와 다르게 입력해주세요.";
    return null;
  }

  function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    showLoading("비밀번호를 변경하고 있습니다...");
    startTransition(async () => {
      try {
        await changePassword({
          currentPassword,
          newPassword,
        });

        openAlert({
          title: "비밀번호가 변경되었습니다.",
          onPrimary: () => {
            router.push("/mypage/profile");
            router.refresh();
          },
        });
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "비밀번호 변경에 실패했습니다. 다시 시도해주세요."));
      } finally {
        hideLoading();
      }
    });
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-5 pb-10 pt-6 md:px-0 md:py-10">
      <div className="mx-auto max-w-content">
        <div className="rounded-[24px] bg-white px-5 py-6 shadow-[0_8px_30px_rgba(185,148,116,0.08)] md:px-8 md:py-8">
          <div className="mb-5 flex items-center gap-1 text-[var(--color-text)]">
            <Link
              href="/mypage/profile"
              aria-label="프로필 관리로 돌아가기"
              className="inline-flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              <BackIcon />
            </Link>
            <h1 className="text-subtitle-18-b tracking-tightest md:text-title-24-sb">비밀번호 변경</h1>
          </div>

          <div className="rounded-[20px] bg-[var(--color-background)] px-5 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-[520px]">
              <p className="text-body-14-r text-[var(--color-text-secondary)]">
                현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="current-password" className="text-body-13-m text-[var(--color-text)]">
                    현재 비밀번호
                  </label>
                  <PasswordInput
                    id="current-password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="현재 비밀번호를 입력해주세요"
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="new-password" className="text-body-13-m text-[var(--color-text)]">
                    새 비밀번호
                  </label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="새 비밀번호를 입력해주세요"
                    autoComplete="new-password"
                  />
                  <p className="text-body-12-m text-[var(--color-text-secondary)]">8자 이상으로 입력해주세요.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm-password" className="text-body-13-m text-[var(--color-text)]">
                    새 비밀번호 확인
                  </label>
                  <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="새 비밀번호를 다시 입력해주세요"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="mt-5 text-center text-body-13-m text-[var(--color-accent-rust)]">{errorMessage}</p>
              )}

              <div className="mt-7 flex gap-3">
                <Link
                  href="/mypage/profile"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[var(--color-ui-disabled)] text-btn-15-sb text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
                >
                  취소
                </Link>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] text-btn-15-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isPending ? "변경 중..." : "변경 완료"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
