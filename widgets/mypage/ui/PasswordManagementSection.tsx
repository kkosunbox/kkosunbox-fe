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

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="1" y1="1" x2="23" y2="23" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
    </svg>
  );
}

function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  visible,
  onToggleVisible,
  inputClassName = "",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  visible: boolean;
  onToggleVisible: () => void;
  inputClassName?: string;
}) {
  return (
    <div
      className={[
        "relative flex items-center rounded-[4px] bg-white",
        inputClassName,
      ].join(" ")}
    >
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-full w-full rounded-[4px] bg-transparent pl-3 pr-10 text-body-13-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
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

export default function PasswordManagementSection() {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
          type: "success",
          title: "비밀번호가 변경되었습니다.",
          onPrimary: () => {
            router.push("/mypage/dog-profile");
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

  const desktopLayout = (
    <div className="max-md:hidden min-h-screen bg-[var(--color-background)] px-6 pb-16 pt-[84px]">
      <div className="mx-auto w-full max-w-[1014px]">
        <div className="rounded-[20px] bg-white px-[28px] pb-[34px] pt-[24px] shadow-[0_8px_30px_rgba(185,148,116,0.08)]">
          <div className="mb-4 flex items-center gap-1 text-[var(--color-text)]">
            <Link
              href="/mypage/dog-profile"
              aria-label="프로필 관리로 돌아가기"
              className="inline-flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              <BackIcon />
            </Link>
            <h1 className="text-title-24-sb tracking-tightest text-[var(--color-text-emphasis)]">비밀번호 변경</h1>
          </div>

          <div className="rounded-[20px] bg-[var(--color-background)] px-7 pb-12 pt-11">
            <div className="mx-auto w-[412px]">
              <div className="grid grid-cols-[94px_220px] items-center gap-x-0 gap-y-4">
                <label htmlFor="current-password" className="text-body-13-m text-[var(--color-text)]">
                  현재 비밀번호
                </label>
                <PasswordField
                  id="current-password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="비밀번호를 입력해주세요"
                  autoComplete="current-password"
                  visible={showCurrent}
                  onToggleVisible={() => setShowCurrent((prev) => !prev)}
                  inputClassName="h-8 w-[220px]"
                />

                <label htmlFor="new-password" className="text-body-13-m text-[var(--color-text)]">
                  새 비밀번호
                </label>
                <PasswordField
                  id="new-password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="새 비밀번호를 입력해주세요"
                  autoComplete="new-password"
                  visible={showNew}
                  onToggleVisible={() => setShowNew((prev) => !prev)}
                  inputClassName="h-8 w-[220px]"
                />

                <div />
                <p className="-mt-1 w-[302px] text-[12px] font-medium leading-[16px] text-[var(--color-text-secondary)]">
                  * 비밀번호는 최소 8자 이상이어야 합니다.
                  <br />
                  * 대문자, 소문자, 숫자, 특수문자를 모두 포함하여 입력해 주세요.
                </p>

                <label htmlFor="confirm-password" className="text-body-13-m text-[var(--color-text)]">
                  비밀번호 확인
                </label>
                <PasswordField
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="비밀번호를 다시 입력해주세요"
                  autoComplete="new-password"
                  visible={showConfirm}
                  onToggleVisible={() => setShowConfirm((prev) => !prev)}
                  inputClassName="h-8 w-[220px]"
                />
              </div>

              {errorMessage && (
                <p className="mt-5 text-center text-body-13-m text-[var(--color-accent-rust)]">{errorMessage}</p>
              )}
            </div>
          </div>

          <div className="mt-[28px] flex justify-end gap-[17px]">
            <Link
              href="/mypage/dog-profile"
              className="inline-flex h-9 w-[132px] items-center justify-center rounded-full bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80"
            >
              취소
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex h-9 w-[132px] items-center justify-center rounded-full bg-[var(--color-accent)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "변경 중..." : "변경 완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const mobileLayout = (
    <div className="md:hidden min-h-screen bg-white px-6 pb-10 pt-4">
      <div className="mb-[26px] flex items-center gap-2 text-[var(--color-text)]">
        <Link
          href="/mypage/dog-profile"
          aria-label="프로필 관리로 돌아가기"
          className="inline-flex h-6 w-6 items-center justify-center text-[var(--color-text-secondary)]"
        >
          <BackIcon />
        </Link>
        <h1 className="text-[18px] font-semibold leading-[21px] tracking-tightest text-[var(--color-text-emphasis)]">
          비밀번호 변경
        </h1>
      </div>

      <div className="rounded-[20px] bg-[var(--color-background)] px-6 pb-12 pt-8">
        <div className="grid grid-cols-[58px_minmax(0,1fr)] items-center gap-x-2 gap-y-4">
          <label
            htmlFor="m-current-password"
            className="break-keep text-body-13-m text-[var(--color-text)]"
          >
            현재 비밀번호
          </label>
          <PasswordField
            id="m-current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="비밀번호를 입력해주세요"
            autoComplete="current-password"
            visible={showCurrent}
            onToggleVisible={() => setShowCurrent((prev) => !prev)}
            inputClassName="h-8 w-full"
          />

          <label
            htmlFor="m-new-password"
            className="break-keep text-body-13-m text-[var(--color-text)]"
          >
            새 비밀번호
          </label>
          <PasswordField
            id="m-new-password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="비밀번호를 다시 입력해주세요"
            autoComplete="new-password"
            visible={showNew}
            onToggleVisible={() => setShowNew((prev) => !prev)}
            inputClassName="h-8 w-full"
          />

          <div />
          <p className="text-[12px] font-medium leading-[16px] text-[var(--color-text-secondary)]">
            * 비밀번호는 최소 8자 이상이어야 합니다.
            <br />
            * 대문자, 소문자, 숫자, 특수문자를 모두 포함하여 입력해 주세요.
          </p>

          <label
            htmlFor="m-confirm-password"
            className="break-keep text-body-13-m text-[var(--color-text)]"
          >
            비밀번호 확인
          </label>
          <PasswordField
            id="m-confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="비밀번호를 입력해주세요"
            autoComplete="new-password"
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((prev) => !prev)}
            inputClassName="h-8 w-full"
          />
        </div>

        {errorMessage && (
          <p className="mt-5 text-center text-body-13-m text-[var(--color-accent-rust)]">{errorMessage}</p>
        )}
      </div>

      <div className="mt-[23px] flex gap-[11px]">
        <Link
          href="/mypage/dog-profile"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80"
        >
          취소
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "변경 중..." : "변경 완료"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
