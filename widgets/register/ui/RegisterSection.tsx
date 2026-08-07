"use client";

import Link from "next/link";
import TermsViewModal from "@/shared/ui/custom-modals/TermsViewModal";
import { useRegisterSection } from "./register-section/useRegisterSection";
import { AGREEMENTS } from "./register-section/constants";
import { CheckboxIcon } from "./register-section/components/CheckboxIcon";
import PasswordToggleIcon from "@/shared/ui/PasswordToggleIcon";
import {
  AuthDesktopShell,
  AuthMobileShell,
  SocialLoginButtons,
  getOAuthUrl,
  authLabelCls,
  authUnderlineInputCls,
  authInlineActionBtnCls,
  authMobileInlineActionBtnCls,
  authCtaButtonCls,
  authMobileCtaButtonCls,
} from "@/features/auth";
import type { OAuthProvider } from "@/features/auth";

/* ═══════════════════════════════════════════════════════════════ */
/* Widget (표현 전담 — 상태·이펙트는 useRegisterSection 소유) */
export default function RegisterSection() {
  const { isPending, canSubmit, email, pw, agree, handleSignup } = useRegisterSection();
  const { emailVerified } = email;

  function handleSocialSignup(provider: OAuthProvider) {
    const url = getOAuthUrl(provider);
    if (url) window.location.href = url;
  }

  const agreementsBlock = (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            agree.toggleAll();
            if (!agree.agreementsOpen) agree.setAgreementsOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <CheckboxIcon checked={agree.allChecked} />
          <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">전체 동의</span>
        </button>
        <button
          type="button"
          onClick={() => agree.setAgreementsOpen((v) => !v)}
          aria-label={agree.agreementsOpen ? "약관 접기" : "약관 펼치기"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 16 16"
            fill="none"
            className={["transition-transform", agree.agreementsOpen ? "" : "rotate-180"].join(" ")}
          >
            <path
              d="M4 10L8 6L12 10"
              stroke="var(--color-text-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {agree.agreementsOpen && (
        <div className="flex flex-col gap-4">
          {AGREEMENTS.map(({ key, label, required }) => (
            <div key={key} className="flex items-center gap-2">
              <button type="button" onClick={() => agree.toggleOne(key)}>
                <CheckboxIcon checked={agree.agreements[key]} />
              </button>
              <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                {label}{" "}
                <span className="text-[var(--color-text-secondary)]">({required ? "필수" : "선택"})</span>
              </span>
              {key !== "marketing" && (
                <button
                  type="button"
                  onClick={() => agree.setTermsModal(key)}
                  className="text-[13px] font-medium leading-[16px] text-[var(--color-text-secondary)] underline transition-opacity hover:opacity-70"
                >
                  보기
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── 렌더 ── */
  return (
    <>
      {agree.termsModal && (
        <TermsViewModal
          type={agree.termsModal}
          onClose={() => agree.setTermsModal(null)}
          onConfirm={() => agree.acceptTerm(agree.termsModal!)}
        />
      )}
      <div className="min-h-svh bg-white max-lg:bg-[var(--color-login-top)]">
        {/* ══════════════════ 모바일·태블릿(<lg) ══════════════════ */}
        <AuthMobileShell active="register">
          <div className="flex flex-col gap-6">
            {/* 이메일 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-email-mobile" className={authLabelCls}>
                이메일
              </label>
              <div className="flex items-end gap-2">
                <input
                  id="reg-email-mobile"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={email.email}
                  onChange={(e) => email.setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !emailVerified && email.handleSendCode()}
                  readOnly={emailVerified}
                  className={[authUnderlineInputCls, "min-w-0 flex-1"].join(" ")}
                  autoComplete="email"
                />
                <button
                  type="button"
                  onClick={email.handleSendCode}
                  disabled={
                    !email.email.trim() ||
                    isPending ||
                    emailVerified ||
                    email.dailyLimitReached ||
                    (email.codeSent && email.countdown > 0)
                  }
                  className={[authMobileInlineActionBtnCls, "min-w-[95px]"].join(" ")}
                >
                  {isPending && !email.codeSent
                    ? "발송 중..."
                    : email.dailyLimitReached
                      ? "발송 제한"
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
                <label htmlFor="reg-otp-mobile" className={authLabelCls}>
                  인증번호
                </label>
                <div className="flex items-end gap-2">
                  <input
                    id="reg-otp-mobile"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="인증번호를 입력해주세요"
                    value={email.otp}
                    onChange={(e) => email.setOtp(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) =>
                      e.key === "Enter" && email.codeSent && !emailVerified && email.handleVerifyOtp()
                    }
                    disabled={emailVerified}
                    className={[authUnderlineInputCls, "min-w-0 flex-1"].join(" ")}
                    autoComplete="one-time-code"
                  />
                  <button
                    type="button"
                    onClick={email.handleVerifyOtp}
                    disabled={!email.otp.trim() || isPending || emailVerified}
                    className={[authMobileInlineActionBtnCls, "min-w-[52px]"].join(" ")}
                  >
                    {isPending && !emailVerified ? "확인 중..." : "확인"}
                  </button>
                </div>
                {emailVerified && (
                  <p className="text-caption-12-r text-[var(--color-accent)]">이메일 인증이 완료되었습니다.</p>
                )}
              </div>
            )}

            {/* 비밀번호 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-pw-mobile" className={authLabelCls}>
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="reg-pw-mobile"
                  type={pw.showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  value={pw.password}
                  onChange={(e) => pw.setPassword(e.target.value)}
                  onFocus={pw.onPasswordFocus}
                  onBlur={pw.onPasswordBlur}
                  disabled={!emailVerified}
                  className={[authUnderlineInputCls, "pr-8"].join(" ")}
                  autoComplete="new-password"
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
              <div className="space-y-0.5 text-[12px] font-medium leading-[16px]">
                <p
                  className={
                    pw.ruleMinLenInvalid
                      ? "text-[var(--color-accent-rust)]"
                      : "text-[var(--color-text-secondary)]"
                  }
                >
                  * 비밀번호는 최소 8자 이상이어야 합니다.
                </p>
                <p
                  className={
                    pw.ruleComplexityInvalid
                      ? "text-[var(--color-accent-rust)]"
                      : "text-[var(--color-text-secondary)]"
                  }
                >
                  * 영문자, 숫자, 특수문자를 포함하여 입력해 주세요.
                </p>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-pw-confirm-mobile" className={authLabelCls}>
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  id="reg-pw-confirm-mobile"
                  type={pw.showPwConfirm ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={pw.passwordConfirm}
                  onChange={(e) => pw.setPasswordConfirm(e.target.value)}
                  onFocus={pw.onConfirmFocus}
                  onBlur={pw.onConfirmBlur}
                  disabled={!emailVerified}
                  className={[authUnderlineInputCls, "pr-8"].join(" ")}
                  autoComplete="new-password"
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
              {pw.passwordMismatch && (
                <p className="text-caption-12-r text-[var(--color-accent-rust)]" role="alert">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">{agreementsBlock}</div>

          <div className="mt-8">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSignup}
              className={authMobileCtaButtonCls}
            >
              {isPending ? "처리 중..." : "회원가입 완료"}
            </button>
          </div>

          <p
            className="mt-[18px] text-center text-body-14-m text-[var(--color-text-secondary)]"
            style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
          >
            - 간편로그인 -
          </p>

          <div className="mt-7">
            <SocialLoginButtons onSelect={handleSocialSignup} />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className="text-body-14-m text-[var(--color-auth-hint)] opacity-40"
              style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
            >
              이미 계정이 있으신가요?
            </span>
            <Link
              href="/login"
              className="text-body-14-sb text-[var(--color-link-warm)]"
              style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
            >
              로그인 하기
            </Link>
          </div>
        </AuthMobileShell>

        {/* ══════════════════ 데스크톱(lg+) ══════════════════ */}
        <AuthDesktopShell
          active="register"
          headingTop="간단한 정보만 입력하고 바로 시작해요!"
          headingBottom="꼬순박스와 함께해요"
          contentGapPx={32}
        >
          <div className="flex flex-col gap-6">
            {/* 이메일 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-email-desktop" className={authLabelCls}>
                이메일
              </label>
              <div className="flex items-end gap-2">
                <input
                  id="reg-email-desktop"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={email.email}
                  onChange={(e) => email.setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !emailVerified && email.handleSendCode()}
                  readOnly={emailVerified}
                  className={[authUnderlineInputCls, "flex-1"].join(" ")}
                  autoComplete="email"
                />
                <button
                  type="button"
                  onClick={email.handleSendCode}
                  disabled={
                    !email.email.trim() ||
                    isPending ||
                    emailVerified ||
                    email.dailyLimitReached ||
                    (email.codeSent && email.countdown > 0)
                  }
                  className={[authInlineActionBtnCls, "min-w-[95px]"].join(" ")}
                >
                  {isPending && !email.codeSent
                    ? "발송 중..."
                    : email.dailyLimitReached
                      ? "발송 제한"
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

            {email.codeSent && (
              <div className="flex flex-col gap-2">
                <label htmlFor="reg-otp-desktop" className={authLabelCls}>
                  인증번호
                </label>
                <div className="flex items-end gap-2">
                  <input
                    id="reg-otp-desktop"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="인증번호를 입력해주세요"
                    value={email.otp}
                    onChange={(e) => email.setOtp(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && !emailVerified && email.handleVerifyOtp()}
                    disabled={emailVerified}
                    className={[authUnderlineInputCls, "flex-1"].join(" ")}
                    autoComplete="one-time-code"
                  />
                  <button
                    type="button"
                    onClick={email.handleVerifyOtp}
                    disabled={!email.otp.trim() || isPending || emailVerified}
                    className={[authInlineActionBtnCls, "min-w-[52px]"].join(" ")}
                  >
                    {isPending && !emailVerified ? "확인 중..." : "확인"}
                  </button>
                </div>
                {emailVerified && (
                  <p className="text-caption-12-r text-[var(--color-accent)]">이메일 인증이 완료되었습니다.</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="reg-pw-desktop" className={authLabelCls}>
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="reg-pw-desktop"
                  type={pw.showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  value={pw.password}
                  onChange={(e) => pw.setPassword(e.target.value)}
                  onFocus={pw.onPasswordFocus}
                  onBlur={pw.onPasswordBlur}
                  disabled={!emailVerified}
                  className={[authUnderlineInputCls, "pr-8"].join(" ")}
                  autoComplete="new-password"
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
              <div className="space-y-0.5 text-[12px] font-medium leading-[16px]">
                <p
                  className={
                    pw.ruleMinLenInvalid
                      ? "text-[var(--color-accent-rust)]"
                      : "text-[var(--color-text-secondary)]"
                  }
                >
                  * 비밀번호는 최소 8자 이상이어야 합니다.
                </p>
                <p
                  className={
                    pw.ruleComplexityInvalid
                      ? "text-[var(--color-accent-rust)]"
                      : "text-[var(--color-text-secondary)]"
                  }
                >
                  * 영문자, 숫자, 특수문자를 포함하여 입력해 주세요.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="reg-pw-confirm-desktop" className={authLabelCls}>
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  id="reg-pw-confirm-desktop"
                  type={pw.showPwConfirm ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={pw.passwordConfirm}
                  onChange={(e) => pw.setPasswordConfirm(e.target.value)}
                  onFocus={pw.onConfirmFocus}
                  onBlur={pw.onConfirmBlur}
                  disabled={!emailVerified}
                  className={[authUnderlineInputCls, "pr-8"].join(" ")}
                  autoComplete="new-password"
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
              {pw.passwordMismatch && (
                <p className="text-caption-12-r text-[var(--color-accent-rust)]" role="alert">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">{agreementsBlock}</div>

          <div className="mt-6">
            <button type="button" disabled={!canSubmit} onClick={handleSignup} className={authCtaButtonCls}>
              {isPending ? "처리 중..." : "가입하기"}
            </button>
          </div>

          <p
            className="mt-6 text-center text-body-14-m text-[var(--color-text-secondary)]"
            style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
          >
            - 간편로그인 -
          </p>

          <div className="mt-6">
            <SocialLoginButtons onSelect={handleSocialSignup} />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span
              className="text-body-14-m text-[var(--color-auth-hint)] opacity-40"
              style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
            >
              이미 계정이 있으신가요?
            </span>
            <Link
              href="/login"
              className="text-body-14-sb text-[var(--color-link-warm)]"
              style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
            >
              로그인 하기
            </Link>
          </div>
        </AuthDesktopShell>
      </div>
    </>
  );
}
