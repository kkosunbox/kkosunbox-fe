"use client";

import {
  AuthDesktopShell,
  AuthMobileShell,
  authLabelCls,
  authUnderlineInputCls,
  authInlineActionBtnCls,
  authMobileInlineActionBtnCls,
  authCtaButtonCls,
  authMobileCtaButtonCls,
} from "@/features/auth";
import PasswordToggleIcon from "@/shared/ui/PasswordToggleIcon";
import { useForgotPasswordSection } from "./forgot-password-section/useForgotPasswordSection";

type ForgotPasswordSectionState = ReturnType<typeof useForgotPasswordSection>;

/* ═══════════════════════════════════════════════════════════════ */
/* 모바일·데스크톱 공용 필드 — 로그인/회원가입과 동일한 밑줄형 입력 패턴 */
function ForgotPasswordFormFields({
  email,
  pw,
  isPending,
  idSuffix,
  mobile,
}: {
  email: ForgotPasswordSectionState["email"];
  pw: ForgotPasswordSectionState["pw"];
  isPending: boolean;
  idSuffix: string;
  mobile: boolean;
}) {
  const { emailVerified } = email;
  const actionBtnCls = mobile ? authMobileInlineActionBtnCls : authInlineActionBtnCls;

  return (
    <div className="flex flex-col gap-6">
      {/* 이메일 */}
      <div className="flex flex-col gap-2">
        <label htmlFor={`fp-email-${idSuffix}`} className={authLabelCls}>이메일</label>
        <div className="flex items-end gap-2">
          <input
            id={`fp-email-${idSuffix}`}
            type="email"
            placeholder="이메일을 입력하세요"
            autoComplete="email"
            value={email.email}
            onChange={(e) => email.setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !emailVerified && email.handleSendCode()}
            readOnly={emailVerified}
            className={[authUnderlineInputCls, "min-w-0 flex-1"].join(" ")}
          />
          <button
            type="button"
            onClick={email.handleSendCode}
            disabled={
              !email.email.trim() || isPending || emailVerified || (email.codeSent && email.countdown > 0)
            }
            className={[actionBtnCls, "min-w-[95px]"].join(" ")}
          >
            {isPending && !email.codeSent
              ? "발송 중..."
              : email.codeSent
                ? email.countdown > 0
                  ? `재전송 (${email.countdown}s)`
                  : "재전송"
                : "인증번호 전송"}
          </button>
        </div>
        {email.codeSent && !emailVerified && (
          <p className="text-caption-12-r text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text)]">{email.email}</span>
            으로 인증코드를 발송했습니다.
          </p>
        )}
      </div>

      {/* 인증번호 */}
      {email.codeSent && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`fp-otp-${idSuffix}`} className={authLabelCls}>인증번호</label>
          <div className="flex items-end gap-2">
            <input
              id={`fp-otp-${idSuffix}`}
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="인증번호를 입력해주세요"
              autoComplete="one-time-code"
              value={email.otp}
              onChange={(e) => email.setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) =>
                e.key === "Enter" && email.codeSent && !emailVerified && email.handleVerifyOtp()
              }
              disabled={emailVerified}
              className={[authUnderlineInputCls, "min-w-0 flex-1"].join(" ")}
            />
            <button
              type="button"
              onClick={email.handleVerifyOtp}
              disabled={!email.otp.trim() || isPending || emailVerified}
              className={[actionBtnCls, "min-w-[52px]"].join(" ")}
            >
              {isPending && !emailVerified ? "확인 중..." : "확인"}
            </button>
          </div>
          {emailVerified && (
            <p className="text-caption-12-r text-[var(--color-accent)]">이메일 인증이 완료되었습니다.</p>
          )}
        </div>
      )}

      {/* 새 비밀번호 */}
      <div className="flex flex-col gap-2">
        <label htmlFor={`fp-pw-${idSuffix}`} className={authLabelCls}>새 비밀번호</label>
        <div className="relative">
          <input
            id={`fp-pw-${idSuffix}`}
            type={pw.showPw ? "text" : "password"}
            placeholder="최소 8자 이상, 대문자, 소문자, 특수문자를 포함"
            autoComplete="new-password"
            value={pw.newPassword}
            onChange={(e) => pw.setNewPassword(e.target.value)}
            disabled={!emailVerified}
            className={[authUnderlineInputCls, "pr-8"].join(" ")}
          />
          <button
            type="button"
            onClick={() => pw.setShowPw((v) => !v)}
            aria-label={pw.showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-80"
          >
            <PasswordToggleIcon visible={pw.showPw} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 비밀번호 확인 */}
      <div className="flex flex-col gap-2">
        <label htmlFor={`fp-pw-confirm-${idSuffix}`} className={authLabelCls}>비밀번호 확인</label>
        <div className="relative">
          <input
            id={`fp-pw-confirm-${idSuffix}`}
            type={pw.showPwConfirm ? "text" : "password"}
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
            value={pw.confirmPassword}
            onChange={(e) => pw.setConfirmPassword(e.target.value)}
            disabled={!emailVerified}
            className={[authUnderlineInputCls, "pr-8"].join(" ")}
          />
          <button
            type="button"
            onClick={() => pw.setShowPwConfirm((v) => !v)}
            aria-label={pw.showPwConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-80"
          >
            <PasswordToggleIcon visible={pw.showPwConfirm} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* Widget (표현 전담 — 상태·이펙트는 useForgotPasswordSection 소유) */
export default function ForgotPasswordSection() {
  const { isPending, canSubmit, email, pw, handleResetPassword } = useForgotPasswordSection();

  return (
    <div className="min-h-svh bg-white max-lg:bg-[var(--color-login-top)]">
      {/* ══════════════════ 모바일·태블릿(<lg) ══════════════════ */}
      <AuthMobileShell>
        <ForgotPasswordFormFields email={email} pw={pw} isPending={isPending} idSuffix="mobile" mobile />

        <div className="mt-8">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleResetPassword}
            className={authMobileCtaButtonCls}
          >
            {isPending ? "처리 중..." : "로그인으로 돌아가기"}
          </button>
        </div>
      </AuthMobileShell>

      {/* ══════════════════ 데스크톱(lg+) ══════════════════ */}
      <AuthDesktopShell
        headingTop="비밀번호 변경을 위해 이메일 인증을 완료해주세요."
        headingBottom="비밀번호 변경하기"
        contentGapPx={32}
      >
        <ForgotPasswordFormFields email={email} pw={pw} isPending={isPending} idSuffix="desktop" mobile={false} />

        <div className="mt-6">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleResetPassword}
            className={authCtaButtonCls}
          >
            {isPending ? "처리 중..." : "로그인으로 돌아가기"}
          </button>
        </div>
      </AuthDesktopShell>
    </div>
  );
}
