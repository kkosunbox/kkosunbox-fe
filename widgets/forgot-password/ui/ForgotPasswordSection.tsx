"use client";

import Image from "next/image";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import registerPaw from "@/widgets/register/assets/register-pow.webp";
import { FieldRow } from "@/widgets/register/ui/register-section/components/FieldRow";
import { RegisterPasswordToggleIcon } from "@/widgets/register/ui/register-section/components/RegisterPasswordToggleIcon";
import { inputBase, inputDisabled, actionBtnCls } from "@/widgets/register/ui/register-section/constants";
import forgotPasswordTitle from "../assets/forgot-password-title.webp";
import { useForgotPasswordSection } from "./forgot-password-section/useForgotPasswordSection";

/* ═══════════════════════════════════════════════════════════════ */
/* Widget (표현 전담 — 상태·이펙트는 useForgotPasswordSection 소유) */
export default function ForgotPasswordSection() {
  const { isPending, canSubmit, email, pw, handleResetPassword } = useForgotPasswordSection();
  const { emailVerified } = email;

  return (
    <div className="min-h-screen bg-white pt-[var(--header-offset)]">
      <div className="mx-auto max-w-[874px] px-5 py-10 md:px-6 lg:px-6 md:py-[96px] lg:py-[96px]">

        {/* 타이틀 */}
        <div className="mb-7 text-center md:mb-11 lg:mb-11">
          <h1>
            <Image
              src={forgotPasswordTitle}
              alt="비밀번호 변경하기"
              quality={HIGH_IMAGE_QUALITY}
              className="mx-auto w-auto max-w-[194px] md:max-w-[222px] lg:max-w-[222px]"
              priority
            />
          </h1>
          <p
            className="mt-3 md:mt-4 lg:mt-4 max-md:text-body-13-r md:text-body-16-r lg:text-body-16-r text-[var(--color-text)]"
            style={{ fontFamily: "Griun PolFairness", letterSpacing: "-0.02em" }}
          >
            비밀번호 변경을 위해 이메일 인증을 완료해주세요.
          </p>
        </div>

        {/* ─── 폼 카드 ─── */}
        <div
          className="relative overflow-hidden rounded-[20px] px-6 py-8 md:mx-auto lg:mx-auto md:w-full lg:w-full md:max-w-[874px] lg:max-w-[874px] md:py-11 lg:py-11 max-md:pb-16 md:pb-20 lg:pb-20"
          style={{ background: "var(--color-surface-warm)" }}
        >
          <div className="flex flex-col gap-4 md:mx-auto lg:mx-auto md:w-[414px] lg:w-[414px]">

            {/* ── 이메일 ── */}
            <FieldRow label="이메일" htmlFor="fp-email">
              <div className="flex gap-2">
                <input
                  id="fp-email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={email.email}
                  onChange={(e) => email.setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !emailVerified && email.handleSendCode()}
                  readOnly={emailVerified}
                  className={[inputBase, emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="email"
                />
                <button
                  type="button"
                  onClick={email.handleSendCode}
                  disabled={!email.email.trim() || isPending || emailVerified || (email.codeSent && email.countdown > 0)}
                  className={[actionBtnCls, "min-w-[95px] px-3 bg-[var(--color-btn-dark-warm)]"].join(" ")}
                >
                  {isPending && !email.codeSent
                    ? "발송 중..."
                    : email.codeSent
                      ? email.countdown > 0 ? `재전송 (${email.countdown}s)` : "재전송"
                      : (
                        <>
                          <span className="max-md:hidden">인증번호 전송</span>
                          <span className="md:hidden">인증번호</span>
                        </>
                      )}
                </button>
              </div>
              {email.codeSent && !emailVerified && (
                <p className="mt-1.5 text-caption-12-r text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text)]">{email.email}</span>으로 인증코드를 발송했습니다.
                </p>
              )}
            </FieldRow>

            {/* ── 인증번호 ── */}
            <FieldRow label="인증번호" htmlFor="fp-otp">
              <div className="flex gap-2">
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="인증번호를 입력해주세요"
                  value={email.otp}
                  onChange={(e) => email.setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && email.codeSent && !emailVerified && email.handleVerifyOtp()}
                  disabled={!email.codeSent || emailVerified}
                  className={[inputBase, (!email.codeSent || emailVerified) ? inputDisabled : ""].join(" ")}
                  autoComplete="one-time-code"
                />
                <button
                  type="button"
                  onClick={email.handleVerifyOtp}
                  disabled={!email.otp.trim() || isPending || !email.codeSent || emailVerified}
                  className={[actionBtnCls, "min-w-[52px] px-2 bg-[var(--color-btn-dark-warm)]"].join(" ")}
                >
                  {isPending && email.codeSent && !emailVerified ? "확인 중..." : "확인"}
                </button>
              </div>
              {emailVerified && (
                <p className="mt-1.5 text-caption-12-r text-[var(--color-accent)]">
                  이메일 인증이 완료되었습니다.
                </p>
              )}
            </FieldRow>

            {/* ── 새비밀번호 ── */}
            <FieldRow label="새비밀번호" htmlFor="fp-pw">
              <div className="relative">
                <input
                  id="fp-pw"
                  type={pw.showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  value={pw.newPassword}
                  onChange={(e) => pw.setNewPassword(e.target.value)}
                  disabled={!emailVerified}
                  className={[inputBase, "pr-10", !emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="new-password"
                />
                {emailVerified && (
                  <button
                    type="button"
                    onClick={() => pw.setShowPw((v) => !v)}
                    aria-label={pw.showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                  >
                    <RegisterPasswordToggleIcon passwordVisible={pw.showPw} />
                  </button>
                )}
              </div>
            </FieldRow>

            {/* ── 비밀번호 확인 ── */}
            <FieldRow label="비밀번호 확인" htmlFor="fp-pw-confirm">
              <div className="relative">
                <input
                  id="fp-pw-confirm"
                  type={pw.showPwConfirm ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={pw.confirmPassword}
                  onChange={(e) => pw.setConfirmPassword(e.target.value)}
                  disabled={!emailVerified}
                  className={[inputBase, "pr-10", !emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="new-password"
                />
                {emailVerified && (
                  <button
                    type="button"
                    onClick={() => pw.setShowPwConfirm((v) => !v)}
                    aria-label={pw.showPwConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                  >
                    <RegisterPasswordToggleIcon passwordVisible={pw.showPwConfirm} />
                  </button>
                )}
              </div>
            </FieldRow>

            {/* 비밀번호 힌트 */}
            <div className="max-md:pl-[80px] md:pl-[94px] lg:pl-[94px] text-[12px] font-medium leading-[16px] text-[var(--color-text-secondary)]">
              <p>* 비밀번호는 최소 8자 이상이어야 합니다.</p>
              <p>* 영문자, 숫자, 특수문자를 포함하여 입력해 주세요.</p>
            </div>
          </div>

          {/* 발바닥 장식 — 카드 기준 배치 */}
          <Image
            src={registerPaw}
            alt=""
            aria-hidden="true"
            className="absolute right-4 bottom-4 md:right-10 lg:right-10 md:bottom-6 lg:bottom-6 w-[60px] h-[50px] md:w-[84px] lg:w-[84px] md:h-[70px] lg:h-[70px] opacity-60"
            style={{ transform: "rotate(-24.12deg)" }}
          />
        </div>

        {/* ─── CTA 버튼 ─── */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleResetPassword}
          className="mt-10 mx-auto flex h-[48px] w-full md:max-w-[412px] lg:max-w-[412px] items-center justify-center rounded-[12px] max-md:text-subtitle-16-sb md:text-body-16-sb lg:text-body-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 md:mt-14 lg:mt-14"
          style={{ background: "var(--color-btn-dark-warm)" }}
        >
          {isPending ? "처리 중..." : "확인"}
        </button>

      </div>
    </div>
  );
}
