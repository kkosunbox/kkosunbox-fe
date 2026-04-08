"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  sendSignupEmailVerification,
  resendEmailVerification,
  verifyEmail,
} from "@/features/auth/api/authApi";
import { signupAction } from "@/features/auth/lib/actions";
import { tokenStore } from "@/shared/lib/api/token";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/lib/api";

/* ─── 상수 ─── */
const RESEND_COOLDOWN = 60;

/* ─── 공통 스타일 ─── */
const inputBase =
  "h-[44px] w-full rounded-lg border border-[var(--color-divider-warm)] bg-white px-4 text-body-14-r text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)] transition-opacity";

const inputDisabled = "opacity-50 pointer-events-none bg-[var(--color-surface-light)]";

const actionBtnCls =
  "h-[44px] shrink-0 rounded-lg px-4 text-body-13-sb text-white whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50";

/* ─── 체크박스 ─── */
function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors"
      style={{
        borderColor: checked ? "var(--color-accent)" : "var(--color-icon-muted)",
        background: checked ? "var(--color-accent)" : "white",
      }}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

/* ─── 눈 아이콘 ─── */
function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
    </svg>
  );
}

/* ─── 발바닥 장식 ─── */
function PawDecoration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-19 -23 38 41" fill="currentColor" aria-hidden="true">
      <ellipse cx="0" cy="6" rx="13" ry="10" />
      <circle cx="-11" cy="-9" r="6" />
      <circle cx="-3" cy="-15" r="6" />
      <circle cx="3" cy="-15" r="6" />
      <circle cx="11" cy="-9" r="6" />
    </svg>
  );
}

/* ─── 에러 메시지 ─── */
function ErrorMsg({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-caption-12-r" style={{ color: "var(--color-accent-rust)" }}>
      {msg}
    </p>
  );
}

/* ─── 약관 목록 ─── */
const AGREEMENTS = [
  { key: "terms"     as const, label: "서비스 이용약관 동의",    required: true  },
  { key: "privacy"   as const, label: "개인정보처리방침 및 동의", required: false },
  { key: "marketing" as const, label: "마케팅 정보 수신 동의",   required: false },
] as const;

/* ─── 필드 행 래퍼 (라벨 + 입력) ─── */
function FieldRow({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex max-md:flex-col md:flex-row md:items-start gap-2 md:gap-4">
      <label
        htmlFor={htmlFor}
        className="shrink-0 md:w-[110px] md:h-[44px] md:flex md:items-center max-md:text-body-13-sb md:text-body-14-sb text-[var(--color-text)]"
      >
        {label}
        {required && <span style={{ color: "var(--color-accent-rust)" }}>*</span>}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { login: authLogin } = useAuth();

  /* ── 상태 ── */
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  /* ── 이메일 ── */
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  /* ── OTP ── */
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── 비밀번호 + 약관 ── */
  const [emailVerifiedToken, setEmailVerifiedToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, marketing: false });
  const [agreementsOpen, setAgreementsOpen] = useState(true);

  /* ── 파생 상태 ── */
  const emailVerified = !!emailVerifiedToken;
  const canSubmit =
    emailVerified &&
    password.length >= 8 &&
    password === passwordConfirm &&
    agreements.terms &&
    !isPending;

  /* ── 타이머 정리 ── */
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /* ── 카운트다운 시작 ── */
  function startCountdown() {
    setCountdown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  /* ── 인증코드 발송 ── */
  function handleSendCode() {
    if (!email.trim()) { setError("이메일을 입력해주세요."); return; }
    setError(null);
    start(async () => {
      try {
        if (codeSent) {
          await resendEmailVerification({ email: email.trim() });
        } else {
          await sendSignupEmailVerification({ email: email.trim() });
        }
        startCountdown();
        setCodeSent(true);
      } catch (err) {
        if (err instanceof ApiError && err.isConflict)
          setError("이미 가입된 이메일입니다.");
        else
          setError("인증코드 발송 중 오류가 발생했습니다.");
      }
    });
  }

  /* ── OTP 확인 ── */
  function handleVerifyOtp() {
    if (!otp.trim()) { setError("인증코드를 입력해주세요."); return; }
    setError(null);
    start(async () => {
      try {
        const res = await verifyEmail({ email: email.trim(), otp: otp.trim() });
        setEmailVerifiedToken(res.emailVerifiedToken);
      } catch (err) {
        if (err instanceof ApiError)
          setError("인증코드가 올바르지 않습니다.");
        else
          setError("인증 확인 중 오류가 발생했습니다.");
      }
    });
  }

  /* ── 회원가입 ── */
  function handleSignup() {
    if (!agreements.terms) { setError("서비스 이용약관에 동의해주세요."); return; }
    if (password.length < 8) { setError("비밀번호는 최소 8자 이상이어야 합니다."); return; }
    if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    setError(null);
    start(async () => {
      const result = await signupAction(
        emailVerifiedToken,
        password,
        agreements.terms,
        agreements.privacy,
        agreements.marketing,
      );
      if (result.error) { setError(result.error); return; }

      if (result.accessToken && result.refreshToken)
        tokenStore.setTokens(result.accessToken, result.refreshToken);

      router.refresh();
      router.push("/mypage/profile");
    });
  }

  /* ── 전체 동의 ── */
  const allChecked = AGREEMENTS.every(({ key }) => agreements[key]);
  function toggleAll() {
    const next = !allChecked;
    setAgreements({ terms: next, privacy: next, marketing: next });
  }
  function toggleOne(key: keyof typeof agreements) {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  /* ── 렌더 ── */
  return (
    <div className="min-h-screen bg-white pt-[54px]">
      <div className="mx-auto max-w-[700px] px-5 py-10 md:px-6 md:py-12">

        {/* 타이틀 */}
        <div className="mb-7 text-center md:mb-10">
          <h1
            className="max-md:text-display-28-eb md:text-display-32-eb"
            style={{ color: "var(--color-primary)" }}
          >
            회원가입을 완료해주세요!
          </h1>
          <p className="mt-3 max-md:text-body-13-r md:text-body-14-r text-[var(--color-text-secondary)]">
            회원가입을 위해 필수 입력사항을 입력해주세요.
          </p>
        </div>

        {/* ─── 폼 카드 ─── */}
        <div
          className="rounded-2xl px-5 py-6 md:px-10 md:py-8"
          style={{ background: "var(--color-surface-warm)" }}
        >
          <div className="flex flex-col gap-5">

            {/* ── 이메일 ── */}
            <FieldRow label="이메일" required htmlFor="reg-email">
              <div className="flex gap-2">
                <input
                  id="reg-email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !emailVerified && handleSendCode()}
                  readOnly={emailVerified}
                  className={[inputBase, emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="email"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!email.trim() || isPending || emailVerified || (codeSent && countdown > 0)}
                  className={[actionBtnCls, "bg-[var(--color-accent)]"].join(" ")}
                >
                  {isPending && !codeSent
                    ? "발송 중..."
                    : codeSent
                      ? countdown > 0 ? `재전송 (${countdown}s)` : "재전송"
                      : "인증번호 전송"}
                </button>
              </div>
              {codeSent && !emailVerified && (
                <p className="mt-1.5 text-caption-12-r text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text)]">{email}</span>으로 인증코드를 발송했습니다.
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
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && codeSent && !emailVerified && handleVerifyOtp()}
                  disabled={!codeSent || emailVerified}
                  className={[inputBase, (!codeSent || emailVerified) ? inputDisabled : ""].join(" ")}
                  autoComplete="one-time-code"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!otp.trim() || isPending || !codeSent || emailVerified}
                  className={[actionBtnCls, "bg-[var(--color-accent-rust)]"].join(" ")}
                >
                  {isPending && codeSent && !emailVerified ? "확인 중..." : "확인"}
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
              <div className="relative">
                <input
                  id="reg-pw"
                  type={showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!emailVerified}
                  className={[inputBase, "pr-10", !emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="new-password"
                />
                {emailVerified && (
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                  >
                    {showPw ? <EyeIcon className="h-[18px] w-[18px]" /> : <EyeOffIcon className="h-[18px] w-[18px]" />}
                  </button>
                )}
              </div>
            </FieldRow>

            {/* ── 비밀번호 확인 ── */}
            <FieldRow label="비밀번호 확인" required htmlFor="reg-pw-confirm">
              <div className="relative">
                <input
                  id="reg-pw-confirm"
                  type={showPwConfirm ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={!emailVerified}
                  className={[inputBase, "pr-10", !emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="new-password"
                />
                {emailVerified && (
                  <button
                    type="button"
                    onClick={() => setShowPwConfirm((v) => !v)}
                    aria-label={showPwConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                  >
                    {showPwConfirm ? <EyeIcon className="h-[18px] w-[18px]" /> : <EyeOffIcon className="h-[18px] w-[18px]" />}
                  </button>
                )}
              </div>
            </FieldRow>

            {/* 비밀번호 힌트 */}
            <div className="md:pl-[126px] text-caption-12-r leading-[1.7] text-[var(--color-text-secondary)]">
              <p>* 비밀번호는 최소 8자 이상이어야 합니다.</p>
              <p>* 대문자, 소문자, 숫자, 특수문자를 모두 포함하여 입력해 주세요.</p>
            </div>
          </div>
        </div>

        {/* ─── 약관 동의 ─── */}
        <div className="relative mt-6 md:mt-8 px-2 md:px-4">
          {/* 전체 동의 + 토글 */}
          <button
            type="button"
            onClick={() => { toggleAll(); if (!agreementsOpen) setAgreementsOpen(true); }}
            className="flex items-center gap-2 text-left"
          >
            <CheckboxIcon checked={allChecked} />
            <span className="text-body-14-sb text-[var(--color-text)]">전체 동의</span>
          </button>
          <button
            type="button"
            onClick={() => setAgreementsOpen((v) => !v)}
            aria-label={agreementsOpen ? "약관 접기" : "약관 펼치기"}
            className="absolute right-2 md:right-4 top-0 p-1"
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className={["transition-transform", agreementsOpen ? "" : "rotate-180"].join(" ")}
            >
              <path d="M4 10L8 6L12 10" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 개별 동의 (접기/펼치기) */}
          {agreementsOpen && (
            <div className="relative mt-4 flex flex-col gap-3">
              {AGREEMENTS.map(({ key, label, required }) => (
                <div key={key} className="flex items-center gap-2">
                  <button type="button" onClick={() => toggleOne(key)}>
                    <CheckboxIcon checked={agreements[key]} />
                  </button>
                  <span className="flex-1 max-md:text-body-13-r md:text-body-14-r text-[var(--color-text)]">
                    {label}{" "}
                    <span className="text-[var(--color-text-secondary)]">({required ? "필수" : "선택"})</span>
                  </span>
                  <button type="button" className="shrink-0 max-md:text-caption-12-r md:text-body-13-r text-[var(--color-text-secondary)] underline">
                    보기
                  </button>
                </div>
              ))}

              {/* 발바닥 장식 */}
              <PawDecoration
                className="absolute -right-2 -bottom-4 md:-right-4 w-[80px] h-[80px] md:w-[100px] md:h-[100px] text-[var(--color-divider-warm)] opacity-60"
              />
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 text-center">
            <ErrorMsg msg={error} />
          </div>
        )}

        {/* ─── CTA 버튼 ─── */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSignup}
          className="mt-8 flex h-[54px] w-full items-center justify-center rounded-full max-md:text-subtitle-16-sb md:text-subtitle-18-sb text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 md:mt-10 md:h-[58px]"
          style={{ background: "var(--color-accent)" }}
        >
          {isPending ? "처리 중..." : "가입하기"}
        </button>

        {/* 로그인 링크 */}
        <div className="mt-4 flex items-center justify-center gap-1 md:mt-6">
          <span className="text-[var(--color-brown-dark)] opacity-40 max-md:text-body-14-m md:text-body-16-m">
            이미 계정이 있으신가요?
          </span>
          <a href="/login" className="text-[var(--color-link-warm)] max-md:text-body-14-sb md:text-body-16-sb">
            로그인하기
          </a>
        </div>

      </div>
    </div>
  );
}
