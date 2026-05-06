"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  sendSignupEmailVerification,
  resendEmailVerification,
  verifyEmail,
} from "@/features/auth/api/authApi";
import { signupAction } from "@/features/auth/lib/actions";
import { tokenStore } from "@/shared/lib/api/token";
import { useAuth } from "@/features/auth";
import { getErrorMessage, isErrorCode } from "@/shared/lib/api";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import TermsViewModal from "@/shared/ui/custom-modals/TermsViewModal";
import registerTitle from "../assets/register-title.webp";
import registerTitleMobi from "../assets/register-title-mobi.webp";
import registerPaw from "../assets/register-pow.webp";

/* ─── 상수 ─── */
const RESEND_COOLDOWN = 60;

/* ─── 공통 스타일 ─── */
const inputBase =
  "h-[32px] w-full md:w-[220px] rounded-[4px] bg-white px-3 text-[13px] font-medium leading-[140%] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-opacity";

const inputDisabled = "opacity-50 pointer-events-none bg-[var(--color-surface-light)]";

const actionBtnCls =
  "h-[32px] shrink-0 rounded-[4px] px-2 text-[13px] font-medium text-white whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50";

/* ─── 체크박스 ─── */
function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[5px] border transition-colors"
      style={{
        borderColor: checked ? "var(--color-accent)" : "var(--color-icon-muted)",
        background: checked ? "var(--color-accent)" : "transparent",
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

/* ─── 비밀번호 보기 토글 (20×20 제공 SVG) ─── */
function RegisterPasswordToggleIcon({ passwordVisible }: { passwordVisible: boolean }) {
  const iconFill = "var(--color-text-secondary)";
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.23145 9.51953C8.18995 9.67265 8.16702 9.83375 8.16699 10C8.16717 11.0123 8.98774 11.8338 10 11.834C10.1661 11.834 10.3264 11.809 10.4795 11.7676L11.6211 12.9092C11.1408 13.1775 10.5892 13.3339 10 13.334L9.8291 13.3291C8.06784 13.24 6.66716 11.7834 6.66699 10C6.66705 9.41054 6.82133 8.85737 7.08984 8.37695L8.23145 9.51953ZM10 6.66699C11.8407 6.66717 13.3338 8.15931 13.334 10L13.3291 10.1719C13.3259 10.2346 13.3191 10.2967 13.3125 10.3584L9.63965 6.68652C9.75794 6.67381 9.87834 6.667 10 6.66699Z"
        fill={iconFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.04883 7.33691C5.15527 8.0249 4.41223 8.81088 3.89258 9.4248C3.68283 9.67261 3.58171 9.79532 3.52148 9.89453C3.48195 9.95974 3.4834 9.97658 3.4834 10C3.4834 10.0234 3.48195 10.0403 3.52148 10.1055C3.58171 10.2047 3.68283 10.3274 3.89258 10.5752C4.49025 11.2813 5.38435 12.2141 6.46191 12.9648C7.5444 13.7189 8.75488 14.25 10 14.25C10.8128 14.25 11.61 14.0222 12.3672 13.6553L13.4785 14.7666C12.4498 15.3378 11.2714 15.7499 10 15.75C8.33258 15.75 6.82311 15.0442 5.60449 14.1953C4.38162 13.3433 3.39247 12.3062 2.74805 11.5449C2.40968 11.1452 1.9834 10.6945 1.9834 10C1.9834 9.30549 2.40968 8.85484 2.74805 8.45508C3.27911 7.8277 4.04529 7.01451 4.98242 6.27051L6.04883 7.33691ZM10 4.25C11.6674 4.25007 13.1769 4.95577 14.3955 5.80469C15.6184 6.65671 16.6076 7.6938 17.252 8.45508C17.5903 8.85481 18.0166 9.30555 18.0166 10C18.0166 10.6944 17.5903 11.1452 17.252 11.5449C16.9014 11.9591 16.4469 12.4529 15.9102 12.9561L14.8496 11.8955C15.3475 11.4318 15.7742 10.9689 16.1074 10.5752C16.3172 10.3274 16.4183 10.2047 16.4785 10.1055C16.518 10.0403 16.5166 10.0234 16.5166 10C16.5166 9.97659 16.518 9.95965 16.4785 9.89453C16.4183 9.79531 16.3172 9.67262 16.1074 9.4248C15.5098 8.71872 14.6156 7.78592 13.5381 7.03516C12.4556 6.28108 11.2451 5.75007 10 5.75C9.61227 5.75 9.22778 5.80183 8.84961 5.89551L7.65527 4.70215C8.38741 4.4243 9.1742 4.25 10 4.25Z"
        fill={iconFill}
      />
      {!passwordVisible ? (
        <path
          d="M4.1665 1.66675L17.4998 15.0001"
          stroke={iconFill}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

/* ─── 약관 목록 ─── */
const AGREEMENTS = [
  { key: "terms"     as const, label: "서비스 이용약관 동의",    required: true  },
  { key: "privacy"   as const, label: "개인정보처리방침 및 동의", required: true  },
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
    <div className="flex max-md:flex-col md:flex-row md:items-start gap-2 md:gap-0">
      <label
        htmlFor={htmlFor}
        className="shrink-0 md:w-[94px] md:h-[32px] md:flex md:items-center text-[13px] font-medium leading-[16px] text-[var(--color-text)]"
      >
        {label}
        {required && <span style={{ color: "var(--color-accent-rust)" }}>*</span>}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function RegisterSection() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { login: authLogin } = useAuth();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();

  /* ── 상태 ── */
  const [isPending, start] = useTransition();

  /* ── 이메일 ── */
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  /* ── OTP ── */
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── 비밀번호 + 약관 ── */
  const [emailVerifiedToken, setEmailVerifiedToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, marketing: false });
  const [agreementsOpen, setAgreementsOpen] = useState(true);
  const [termsModal, setTermsModal] = useState<"terms" | "privacy" | "marketing" | null>(null);

  /* ── 파생 상태 ── */
  const emailVerified = !!emailVerifiedToken;
  const canSubmit =
    emailVerified &&
    password.length >= 8 &&
    password === passwordConfirm &&
    agreements.terms &&
    agreements.privacy &&
    !isPending;

  /** 에러를 알림 모달로 표시 */
  function showError(msg: string) {
    openAlert({ title: msg });
  }

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
    if (!email.trim()) { showError("이메일을 입력해주세요."); return; }
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
        if (isErrorCode(err, "COOLDOWN_PERIOD_NOT_EXPIRED")) {
          startCountdown();
        }
        if (isErrorCode(err, "DAILY_LIMIT_REACHED")) {
          setDailyLimitReached(true);
        }
        showError(getErrorMessage(err, "인증코드 발송 중 오류가 발생했습니다."));
      }
    });
  }

  /* ── OTP 확인 ── */
  function handleVerifyOtp() {
    if (!otp.trim()) { showError("인증코드를 입력해주세요."); return; }
    start(async () => {
      try {
        const res = await verifyEmail({ email: email.trim(), otp: otp.trim() });
        setEmailVerifiedToken(res.emailVerifiedToken);
      } catch (err) {
        showError(getErrorMessage(err, "인증 확인 중 오류가 발생했습니다."));
      }
    });
  }

  /* ── 회원가입 ── */
  function handleSignup() {
    if (!agreements.terms) { showError("서비스 이용약관에 동의해주세요."); return; }
    if (!agreements.privacy) { showError("개인정보처리방침에 동의해주세요."); return; }
    if (password.length < 8) { showError("비밀번호는 최소 8자 이상이어야 합니다."); return; }
    if (password !== passwordConfirm) { showError("비밀번호가 일치하지 않습니다."); return; }
    showLoading("회원가입을 처리하고 있습니다...");
    start(async () => {
      try {
        const result = await signupAction(
          emailVerifiedToken,
          password,
          agreements.terms,
          agreements.privacy,
          agreements.marketing,
        );
        if (result.error) { showError(result.error); return; }

        if (result.accessToken && result.refreshToken)
          tokenStore.setTokens(result.accessToken, result.refreshToken);

        router.refresh();
        router.push("/");
      } finally {
        hideLoading();
      }
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
    <>
    {termsModal && (
      <TermsViewModal
        type={termsModal}
        onClose={() => setTermsModal(null)}
        onConfirm={() => setAgreements((prev) => ({ ...prev, [termsModal]: true }))}
      />
    )}
    <div className="min-h-screen bg-white pt-[54px]">
      <div className="mx-auto max-w-[874px] px-5 py-10 md:px-6 md:py-12">

        {/* 타이틀 */}
        <div className="mb-7 text-center md:mb-11">
          <h1>
            <Image
              src={registerTitleMobi}
              alt="회원가입을 완료해주세요!"
              className="mx-auto w-auto max-w-[98px] md:hidden"
              priority
            />
            <Image
              src={registerTitle}
              alt="회원가입을 완료해주세요!"
              className="mx-auto w-auto max-md:hidden md:max-w-[322px]"
              priority
            />
          </h1>
          <p
            className="mt-3 md:mt-4 max-md:text-body-13-r md:text-body-16-r text-[var(--color-text)]"
            style={{ fontFamily: "Griun PolFairness", letterSpacing: "-0.02em" }}
          >
            회원가입을 위해 필수 입력사항을 입력해주세요.
          </p>
        </div>

        {/* ─── 폼 카드 ─── */}
        <div
          className="relative overflow-hidden rounded-[20px] px-5 py-6 md:mx-auto md:w-full md:max-w-[874px] md:min-h-[524px] md:py-11"
          style={{ background: "var(--color-surface-warm)" }}
        >
          <div className="flex flex-col gap-4 md:mx-auto md:w-[414px]">

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
                  disabled={!email.trim() || isPending || emailVerified || dailyLimitReached || (codeSent && countdown > 0)}
                  className={[actionBtnCls, "bg-[var(--color-accent)]"].join(" ")}
                >
                  {isPending && !codeSent
                    ? "발송 중..."
                    : dailyLimitReached
                      ? "발송 제한"
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
                  className={[actionBtnCls, "bg-[var(--color-accent)]"].join(" ")}
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
                    <RegisterPasswordToggleIcon passwordVisible={showPw} />
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
                    <RegisterPasswordToggleIcon passwordVisible={showPwConfirm} />
                  </button>
                )}
              </div>
            </FieldRow>

            {/* 비밀번호 힌트 */}
            <div className="md:pl-[94px] text-[12px] font-medium leading-[16px] text-[var(--color-text-secondary)]">
              <p>* 비밀번호는 최소 8자 이상이어야 합니다.</p>
              <p>* 대문자, 소문자, 숫자, 특수문자를 모두 포함하여 입력해 주세요.</p>
            </div>

            {/* ─── 약관 동의 ─── */}
            <div className="mt-2 flex flex-col gap-5">
              {/* 전체 동의 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { toggleAll(); if (!agreementsOpen) setAgreementsOpen(true); }}
                  className="flex items-center gap-2"
                >
                  <CheckboxIcon checked={allChecked} />
                  <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">전체 동의</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAgreementsOpen((v) => !v)}
                  aria-label={agreementsOpen ? "약관 접기" : "약관 펼치기"}
                >
                  <svg
                    width="24" height="24" viewBox="0 0 16 16" fill="none"
                    className={["transition-transform", agreementsOpen ? "" : "rotate-180"].join(" ")}
                  >
                    <path d="M4 10L8 6L12 10" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* 개별 동의 (접기/펼치기) */}
              {agreementsOpen && (
                <div className="flex flex-col gap-4">
                  {AGREEMENTS.map(({ key, label, required }) => (
                    <div key={key} className="flex items-center gap-2">
                      <button type="button" onClick={() => toggleOne(key)}>
                        <CheckboxIcon checked={agreements[key]} />
                      </button>
                      <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                        {label}{" "}
                        <span className="text-[var(--color-text-secondary)]">({required ? "필수" : "선택"})</span>
                      </span>
                      {key !== "marketing" && (
                        <button
                          type="button"
                          onClick={() => setTermsModal(key)}
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
            className="absolute right-4 bottom-4 md:bottom-[88px] md:right-[44px] w-[60px] h-[50px] md:w-[84px] md:h-[70px] opacity-60"
          />
        </div>

        {/* ─── CTA 버튼 ─── */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSignup}
          className="mt-10 mx-auto flex h-[48px] w-full md:max-w-[412px] items-center justify-center rounded-full max-md:text-subtitle-16-sb md:text-subtitle-18-sb text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 md:mt-14 md:h-[54px]"
          style={{ background: "var(--color-accent)" }}
        >
          {isPending ? "처리 중..." : "가입하기"}
        </button>

        {/* 로그인 링크 */}
        {/* <div className="mt-4 flex items-center justify-center gap-1 md:mt-6">
          <span className="text-[var(--color-brown-dark)] opacity-40 max-md:text-body-14-m md:text-body-16-m">
            이미 계정이 있으신가요?
          </span>
          <a href="/login" className="text-[var(--color-link-warm)] max-md:text-body-14-sb md:text-body-16-sb">
            로그인하기
          </a>
        </div> */}

      </div>
    </div>
    </>
  );
}
