"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  completeSignupAction,
  consumeOAuthReturnPath,
  logoutAction,
} from "@/features/auth";
import { trackSignUp } from "@/shared/lib/analytics";
import { tokenStore } from "@/shared/lib/api/token";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import {
  PRIVACY_CONTENT,
  TERMS_CONTENT,
} from "@/shared/ui/custom-modals/TermsViewModal";
import socialRegisterTitle from "../assets/social-register-title.svg";

type AgreementKey = "terms" | "privacy" | "marketing";
type AgreementState = Record<AgreementKey, boolean>;
type AgreementSection = {
  title: string;
  content?: string;
  items?: string[];
};

const INITIAL_AGREEMENTS: AgreementState = {
  terms: false,
  privacy: false,
  marketing: false,
};

function toPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = toPhoneDigits(value).slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  const splitAt = digits.length === 11 ? 7 : 6;
  return `${digits.slice(0, 3)}-${digits.slice(3, splitAt)}-${digits.slice(splitAt)}`;
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
        checked
          ? "border-[var(--color-cta-button)] bg-[var(--color-cta-button)]"
          : "border-[var(--color-border)] bg-white",
      ].join(" ")}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path
            d="M1 4L4 7.5L10 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function AgreementCopy({ sections }: { sections: AgreementSection[] }) {
  return (
    <div className="h-[136px] space-y-4 overflow-y-auto rounded-[12px] border border-[var(--color-text-muted)] bg-white px-6 py-4 md:h-36 md:px-7">
      {sections.map((section) => (
        <article key={section.title} className="text-[13px] font-medium leading-4 text-black">
          <h3 className="font-semibold">{section.title}</h3>
          {section.content && <p>{section.content}</p>}
          {section.items?.map((item) => <p key={item}>{item}</p>)}
        </article>
      ))}
    </div>
  );
}

function AgreementToggle({
  checked,
  label,
  required,
  onChange,
}: {
  checked: boolean;
  label: string;
  required: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="flex items-center gap-2 text-left text-[13px] font-medium leading-4 text-[var(--color-text)]"
    >
      <Checkbox checked={checked} />
      <span>{label}</span>
      <span className={required ? "text-[var(--color-accent-rust)]" : "text-[var(--color-text-secondary)]"}>
        ({required ? "필수" : "선택"})
      </span>
    </button>
  );
}

interface SocialRegisterSectionProps {
  preview?: boolean;
}

/** 소셜 로그인 신규 사용자가 연락처와 필수 약관 동의를 제출해 가입을 마무리한다. */
export default function SocialRegisterSection({ preview = false }: SocialRegisterSectionProps) {
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [agreements, setAgreements] = useState<AgreementState>(INITIAL_AGREEMENTS);

  const isPhoneValid = /^01\d{8,9}$/.test(toPhoneDigits(phone));
  const allChecked = Object.values(agreements).every(Boolean);
  const canSubmit = isPhoneValid && agreements.terms && agreements.privacy && !isPending;

  function toggleAgreement(key: AgreementKey) {
    setAgreements((current) => ({ ...current, [key]: !current[key] }));
  }

  function handleCancel() {
    if (isPending) return;
    if (preview) {
      openAlert({ title: "디자인 검수용 페이지입니다." });
      return;
    }
    showLoading("로그인 화면으로 이동하고 있습니다...");
    startTransition(async () => {
      try {
        await logoutAction();
        tokenStore.clear();
        consumeOAuthReturnPath();
        window.location.replace("/login");
      } finally {
        hideLoading();
      }
    });
  }

  function handleSubmit() {
    if (!isPhoneValid) {
      openAlert({ title: "올바른 휴대전화 번호를 입력해주세요." });
      return;
    }
    if (!agreements.terms || !agreements.privacy) {
      openAlert({ title: "필수 약관에 동의해주세요." });
      return;
    }
    if (preview) {
      openAlert({ type: "success", title: "디자인 검수용 페이지입니다." });
      return;
    }

    showLoading("회원가입을 완료하고 있습니다...");
    startTransition(async () => {
      try {
        const result = await completeSignupAction(
          agreements.terms,
          agreements.privacy,
          agreements.marketing,
          toPhoneDigits(phone),
        );
        if (result.error || !result.user) {
          openAlert({ title: result.error ?? "회원가입을 완료하지 못했습니다." });
          return;
        }

        trackSignUp();
        window.location.replace(consumeOAuthReturnPath() ?? "/");
      } catch {
        openAlert({ title: "회원가입을 완료하지 못했습니다. 다시 시도해주세요." });
      } finally {
        hideLoading();
      }
    });
  }

  return (
    <section className="bg-white max-md:min-h-dvh max-md:pt-[68px] md:pt-[calc(var(--header-offset)+64px)]">
      <div className="mx-auto w-full max-w-[1240px] max-md:px-6 md:px-8 lg:px-0">
        <h1>
          <Image
            src={socialRegisterTitle}
            alt="꼬순박스가 처음이시군요. 가입절차를 완료해주세요."
            priority
            className="h-auto w-[285px] md:w-[380px]"
          />
        </h1>

        <section
          aria-labelledby="social-register-phone-label"
          className="mt-8 rounded-[12px] border border-[var(--color-text-muted)] px-8 py-6 max-md:px-4 max-md:py-4 md:mt-[76px] md:h-[150px]"
        >
          <label
            id="social-register-phone-label"
            htmlFor="social-register-phone"
            className="block text-[14px] font-bold leading-[17px] tracking-[-0.04em] text-[var(--color-text)]"
          >
            연락처
          </label>
          <input
            id="social-register-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(formatPhone(event.target.value))}
            placeholder="연락처를 입력하세요"
            className="mt-4 h-8 w-full max-w-[327px] border-b border-[var(--color-text-muted)] bg-transparent text-[14px] font-medium leading-5 text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-cta-button)]"
          />
          <p className="mt-3 text-[13px] font-medium leading-4 text-[var(--color-text)]">
            주문/배송 안내 및 알림톡 발송을 위해 사용됩니다.
          </p>
        </section>

        <section className="mt-6 rounded-[12px] bg-[var(--color-surface-light)] px-8 py-6 max-md:px-4 max-md:py-4">
          <button
            type="button"
            role="checkbox"
            aria-checked={allChecked}
            onClick={() => {
              const next = !allChecked;
              setAgreements({ terms: next, privacy: next, marketing: next });
            }}
            className="flex items-center gap-2 text-left text-[14px] font-bold leading-[17px] tracking-[-0.04em] text-[var(--color-text)]"
          >
            <Checkbox checked={allChecked} />
            이용약관, 개인정보 수집 및 이용에 전체 동의합니다.
          </button>
          <p className="mt-4 max-w-[540px] text-[13px] font-medium leading-4 text-[var(--color-text)]">
            개인정보 수집 및 이용, 온라인 신청 서비스 정책, 고유 식별정보 수집 및 이용 항목에 대해 모두 동의합니다.<br />
            선택 약관에 동의하지 않아도 서비스 이용이 가능합니다.
          </p>

          <div className="mt-10 space-y-5 max-md:mt-8">
            <div className="space-y-3">
              <AgreementToggle
                checked={agreements.terms}
                label="이용약관 동의"
                required
                onChange={() => toggleAgreement("terms")}
              />
              <AgreementCopy sections={TERMS_CONTENT} />
            </div>

            <div className="space-y-3">
              <AgreementToggle
                checked={agreements.privacy}
                label="개인정보 수집 및 이용 동의"
                required
                onChange={() => toggleAgreement("privacy")}
              />
              <AgreementCopy sections={PRIVACY_CONTENT} />
            </div>

            <AgreementToggle
              checked={agreements.marketing}
              label="마케팅 정보 수신 동의"
              required={false}
              onChange={() => toggleAgreement("marketing")}
            />
          </div>
        </section>

      <div className="mx-auto flex md:mt-16 md:w-[332px] md:gap-3 md:pb-[50px] max-md:mt-7 max-md:w-full max-md:gap-4 max-md:pb-8">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="flex items-center justify-center rounded-[8px] border border-[var(--color-status-done-bg)] bg-white text-[14px] font-[600] leading-[21px] tracking-[-0.02em] text-[var(--color-text-label)] disabled:opacity-50 md:h-10 md:w-40 md:flex-none max-md:h-12 max-md:flex-1"
        >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          className="flex items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-[14px] font-[600] leading-[21px] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:h-10 md:w-40 md:flex-none max-md:h-12 max-md:flex-1"
          >
            가입하기
          </button>
        </div>
      </div>
    </section>
  );
}
