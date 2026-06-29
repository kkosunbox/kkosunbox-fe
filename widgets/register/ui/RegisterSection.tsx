"use client";

import Image from "next/image";
import TermsViewModal from "@/shared/ui/custom-modals/TermsViewModal";
import registerTitle from "../assets/register-title.webp";
import registerTitleMobi from "../assets/register-title-mobi.webp";
import registerPaw from "../assets/register-pow.webp";
import { useRegisterSection } from "./register-section/useRegisterSection";
import { AGREEMENTS, inputBase, inputDisabled, actionBtnCls } from "./register-section/constants";
import { CheckboxIcon } from "./register-section/components/CheckboxIcon";
import { RegisterPasswordToggleIcon } from "./register-section/components/RegisterPasswordToggleIcon";
import { FieldRow } from "./register-section/components/FieldRow";

/* ═══════════════════════════════════════════════════════════════ */
/* Widget (표현 전담 — 상태·이펙트는 useRegisterSection 소유) */
export default function RegisterSection() {
  const { isPending, canSubmit, email, pw, agree, handleSignup } = useRegisterSection();
  const { emailVerified } = email;

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
    <div className="min-h-screen bg-white pt-[var(--header-offset)]">
      <div className="mx-auto max-w-[874px] px-5 py-10 md:px-6 lg:px-6 md:py-[96px] lg:py-[96px]">

        {/* 타이틀 */}
        <div className="mb-7 text-center md:mb-11 lg:mb-11">
          <h1>
            <Image
              src={registerTitleMobi}
              alt="회원가입을 완료해주세요!"
              className="mx-auto w-auto max-w-[98px] md:hidden lg:hidden"
              priority
            />
            <Image
              src={registerTitle}
              alt="회원가입을 완료해주세요!"
              className="mx-auto w-auto max-md:hidden md:max-w-[322px] lg:max-w-[322px]"
              priority
            />
          </h1>
          <p
            className="mt-3 md:mt-4 lg:mt-4 max-md:text-body-13-r md:text-body-16-r lg:text-body-16-r text-[var(--color-text)]"
            style={{ fontFamily: "Griun PolFairness", letterSpacing: "-0.02em" }}
          >
            회원가입을 위해 필수 입력사항을 입력해주세요.
          </p>
        </div>

        {/* ─── 폼 카드 ─── */}
        <div
          className="relative overflow-hidden rounded-[20px] px-6 py-8 md:mx-auto lg:mx-auto md:w-full lg:w-full md:max-w-[874px] lg:max-w-[874px] md:min-h-[524px] lg:min-h-[524px] max-md:pb-16 md:py-11 lg:py-11 lg:pb-[64px]"
          style={{ background: "var(--color-support-faq-surface)" }}
        >
          <div className="flex flex-col gap-4 md:mx-auto lg:mx-auto md:w-[420px] lg:w-[420px]">

            {/* ── 이메일 ── */}
            <FieldRow label="이메일" required htmlFor="reg-email">
              <div className="flex gap-2">
                <input
                  id="reg-email"
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
                  disabled={!email.email.trim() || isPending || emailVerified || email.dailyLimitReached || (email.codeSent && email.countdown > 0)}
                  className={[actionBtnCls, "min-w-[95px] px-3 bg-[var(--color-btn-dark-warm)]"].join(" ")}
                >
                  {isPending && !email.codeSent
                    ? "발송 중..."
                    : email.dailyLimitReached
                      ? "발송 제한"
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
            <FieldRow label="인증번호" required htmlFor="reg-otp">
              <div className="flex gap-2">
                <input
                  id="reg-otp"
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

            {/* ── 비밀번호 ── */}
            <FieldRow label="비밀번호" required htmlFor="reg-pw">
              <div className="relative w-full md:w-[220px]">
                <input
                  id="reg-pw"
                  type={pw.showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  value={pw.password}
                  onChange={(e) => pw.setPassword(e.target.value)}
                  onFocus={pw.onPasswordFocus}
                  onBlur={pw.onPasswordBlur}
                  disabled={!emailVerified}
                  className={[inputBase, "pr-10", !emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => pw.setShowPw((v) => !v)}
                  aria-label={pw.showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                >
                  <RegisterPasswordToggleIcon passwordVisible={pw.showPw} />
                </button>
              </div>
            </FieldRow>

            {/* ── 비밀번호 확인 ── */}
            <FieldRow label="비밀번호 확인" required htmlFor="reg-pw-confirm">
              <div className="relative w-full md:w-[220px]">
                <input
                  id="reg-pw-confirm"
                  type={pw.showPwConfirm ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={pw.passwordConfirm}
                  onChange={(e) => pw.setPasswordConfirm(e.target.value)}
                  onFocus={pw.onConfirmFocus}
                  onBlur={pw.onConfirmBlur}
                  disabled={!emailVerified}
                  className={[inputBase, "pr-10", !emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => pw.setShowPwConfirm((v) => !v)}
                  aria-label={pw.showPwConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                >
                  <RegisterPasswordToggleIcon passwordVisible={pw.showPwConfirm} />
                </button>
              </div>
              {pw.passwordMismatch && (
                <p className="mt-1.5 text-caption-12-r text-[var(--color-accent-rust)]" role="alert">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </FieldRow>

            {/* 비밀번호 힌트 */}
            <div className="max-md:pl-[80px] md:pl-[94px] lg:pl-[94px] space-y-0.5 text-[12px] font-medium leading-[16px]">
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

            {/* ─── 약관 동의 ─── */}
            <div className="mt-2 flex flex-col gap-5">
              {/* 전체 동의 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { agree.toggleAll(); if (!agree.agreementsOpen) agree.setAgreementsOpen(true); }}
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
                    width="24" height="24" viewBox="0 0 16 16" fill="none"
                    className={["transition-transform", agree.agreementsOpen ? "" : "rotate-180"].join(" ")}
                  >
                    <path d="M4 10L8 6L12 10" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* 개별 동의 (접기/펼치기) */}
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
                          className="text-[13px] font-medium leading-[16px] text-[var(--color-text-secondary)] underline hover:opacity-70 transition-opacity"
                        >
                          보기
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 발바닥 장식 — 카드 기준 배치 (패딩 영역 위에 걸침) */}
          <Image
            src={registerPaw}
            alt=""
            aria-hidden="true"
            className="absolute right-4 bottom-4 md:bottom-[36px] lg:bottom-[36px] md:right-[44px] lg:right-[44px] w-[60px] h-[50px] md:w-[84px] lg:w-[84px] md:h-[70px] lg:h-[70px] opacity-60"
          />
        </div>

        {/* ─── CTA 버튼 ─── */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSignup}
          className="mt-10 mx-auto flex h-[48px] w-full md:max-w-[412px] lg:max-w-[412px] items-center justify-center rounded-[12px] max-md:text-subtitle-16-sb md:text-body-16-sb lg:text-body-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 md:mt-14 lg:mt-14"
          style={{ background: "var(--color-btn-dark-warm)" }}
        >
          {isPending ? "처리 중..." : "가입하기"}
        </button>

        {/* 로그인 링크 */}
        {/* <div className="mt-4 flex items-center justify-center gap-1 md:mt-6 lg:mt-6">
          <span className="text-[var(--color-brown-dark)] opacity-40 max-md:text-body-14-m md:text-body-16-m lg:text-body-16-m">
            이미 계정이 있으신가요?
          </span>
          <a href="/login" className="text-[var(--color-link-warm)] max-md:text-body-14-sb md:text-body-16-sb lg:text-body-16-sb">
            로그인하기
          </a>
        </div> */}

      </div>
    </div>
    </>
  );
}
