"use client";

import { useState } from "react";

/* ─── Icons ─── */
function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="#9E9E9E" strokeWidth="1.5" />
    </svg>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors"
      style={{
        borderColor: checked ? "var(--color-accent)" : "#CCCCCC",
        background:  checked ? "var(--color-accent)" : "white",
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

function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Shared styles ─── */
const inputCls =
  "h-[44px] w-full rounded-lg border border-[var(--color-divider-warm)] bg-white px-4 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]";

const actionBtnCls =
  "h-[44px] shrink-0 rounded-lg bg-[var(--color-accent)] px-4 text-[13px] font-semibold text-white whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-80";

/* ─── Label + Row helpers ─── */
const LABEL_W = "w-[66px] md:w-[96px]";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[13px] font-semibold leading-tight text-[var(--color-text)] md:text-[14px]">
      {children}
      <span style={{ color: "var(--color-accent-rust)" }}>*</span>
    </span>
  );
}

function FormRow({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <div className={`${LABEL_W} shrink-0`}>{label}</div>
      <div className="flex flex-1 items-center gap-2">{children}</div>
    </div>
  );
}

/* ─── Password helper text ─── */
function PasswordHint({ className }: { className?: string }) {
  return (
    <div className={["text-[12px] leading-[1.7] text-[var(--color-text-secondary)]", className].filter(Boolean).join(" ")}>
      <p>* 비밀번호는 최소 8자 이상이어야 합니다.</p>
      <p>* 대문자, 소문자, 숫자, 특수문자를 모두 포함하여 입력해 주세요.</p>
    </div>
  );
}

/* ─── Agreement item ─── */
const AGREEMENTS = [
  { key: "terms"     as const, label: "서비스 이용약관 동의",   required: true  },
  { key: "privacy"   as const, label: "개인정보처리방침 및 동의", required: false },
  { key: "marketing" as const, label: "마케팅 정보 수신 동의",   required: false },
] as const;

/* ─── Page ─── */
export default function RegisterPage() {
  const [id,              setId]              = useState("");
  const [password,        setPassword]        = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw,          setShowPw]          = useState(false);
  const [showPwConfirm,   setShowPwConfirm]   = useState(false);

  const [agreements, setAgreements] = useState({
    terms:     false,
    privacy:   false,
    marketing: false,
  });

  const allChecked = AGREEMENTS.every(({ key }) => agreements[key]);

  function toggleAll() {
    const next = !allChecked;
    setAgreements({ terms: next, privacy: next, marketing: next });
  }

  function toggleOne(key: keyof typeof agreements) {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-white pt-[54px]">
      <div className="mx-auto max-w-[700px] px-5 py-10 md:px-6 md:py-12">

        {/* ── 타이틀 ── */}
        <div className="mb-7 text-center md:mb-8">
          <h1
            className="text-[28px] font-extrabold tracking-[-0.04em] md:text-[32px]"
            style={{ color: "var(--color-primary)" }}
          >
            회원가입
          </h1>
          <p className="mt-3 text-[13px] text-[var(--color-text-secondary)] md:text-[14px]">
            회원가입을 위해 필수 입력사항을 입력해주세요.
          </p>
        </div>

        {/* ── 폼 카드 ── */}
        <div
          className="rounded-2xl px-5 py-6 md:px-10 md:py-8"
          style={{ background: "var(--color-surface-warm)" }}
        >
          <div className="flex flex-col gap-4 md:gap-5">

            {/* 아이디 */}
            <FormRow label={<RequiredLabel>아이디</RequiredLabel>}>
              <input
                type="text"
                placeholder="아이디를 입력해주세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className={inputCls}
                autoComplete="username"
              />
              <button type="button" className={actionBtnCls}>
                중복확인
              </button>
            </FormRow>

            {/* 비밀번호 */}
            <FormRow label={<RequiredLabel>비밀번호</RequiredLabel>}>
              <div className="relative flex-1">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                >
                  {showPw
                    ? <EyeIcon    className="h-[18px] w-[18px]" />
                    : <EyeOffIcon className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </FormRow>

            {/* 헬퍼 텍스트 — 데스크톱: 비밀번호 아래 */}
            <PasswordHint
              className={`max-md:hidden pl-[calc(96px+16px)]`}
            />

            {/* 비밀번호 확인 */}
            <FormRow
              label={
                <RequiredLabel>
                  {/* 모바일: 두 줄 / 데스크톱: 한 줄 */}
                  <span className="max-md:hidden">비밀번호확인</span>
                  <span className="md:hidden">
                    비밀번호
                    <br />
                    확인
                  </span>
                </RequiredLabel>
              }
            >
              <div className="relative flex-1">
                <input
                  type={showPwConfirm ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className={`${inputCls} pr-10`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwConfirm((v) => !v)}
                  aria-label={showPwConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                >
                  {showPwConfirm
                    ? <EyeIcon    className="h-[18px] w-[18px]" />
                    : <EyeOffIcon className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </FormRow>

            {/* 헬퍼 텍스트 — 모바일: 비밀번호확인 아래 */}
            <PasswordHint className="md:hidden pl-1" />

            {/* ── 동의 섹션 ── */}
            <div className="border-t border-[var(--color-divider-warm)] pt-1" />

            {/* 전체 동의 */}
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 text-left"
            >
              <CheckboxIcon checked={allChecked} />
              <span className="text-[14px] font-semibold text-[var(--color-text)]">
                전체 동의
              </span>
              <span className="ml-1 text-[var(--color-text-secondary)]">
                <ChevronUpIcon />
              </span>
            </button>

            {/* 개별 동의 항목 */}
            <div className="flex flex-col gap-3">
              {AGREEMENTS.map(({ key, label, required }) => (
                <div key={key} className="flex items-center gap-2">
                  <button type="button" onClick={() => toggleOne(key)}>
                    <CheckboxIcon checked={agreements[key]} />
                  </button>
                  <span className="flex-1 text-[13px] text-[var(--color-text)] md:text-[14px]">
                    {label}{" "}
                    <span className="text-[var(--color-text-secondary)]">
                      ({required ? "필수" : "선택"})
                    </span>
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-[12px] text-[var(--color-text-secondary)] underline md:text-[13px]"
                  >
                    보기
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── 가입하기 버튼 ── */}
        <button
          type="submit"
          className="mt-6 flex h-[54px] w-full items-center justify-center rounded-full text-[16px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 md:mt-8 md:h-[58px] md:text-[17px]"
          style={{ background: "var(--color-accent)" }}
        >
          가입하기
        </button>

      </div>
    </div>
  );
}
