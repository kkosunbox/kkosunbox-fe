"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createInquiry } from "@/features/inquiry/api";
import { ApiError } from "@/shared/lib/api/types";
import InquiryTitle from "@/widgets/support/faq/assets/inquiry-title.png";
import InquiryTitleMobile from "@/widgets/support/faq/assets/inquiry-title-mobile.png";

interface FormState {
  name: string;
  phone: string;
  email: string;
  message: string;
  fileName: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

const fieldClass =
  "min-h-[42px] w-full rounded-full bg-[var(--color-surface-light)] px-5 py-[15px] text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0";

const labelClass =
  "text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80";

function PaperclipIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.44 11.05l-9.19 9.19a4.5 4.5 0 01-6.364-6.364l9.19-9.19a3 3 0 114.243 4.242l-9.192 9.192a1.5 1.5 0 01-2.122-2.122L16.5 7.5"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConsentCheckboxChecked() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect width="20" height="20" rx="5" fill="var(--color-accent)" />
      <path
        d="M4.16699 10.833L7.50033 14.1663L15.8337 5.83301"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConsentCheckboxUnchecked() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="19" height="19" rx="4.5" stroke="var(--color-border)" fill="none" />
    </svg>
  );
}

export default function InquirySection() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    message: "",
    fileName: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (field: "agreeTerms" | "agreePrivacy") => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, fileName: file ? file.name : "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !phone || !email || !message || !form.agreeTerms || !form.agreePrivacy) return;

    const titleBase = `[문의] ${name}`;
    const title = titleBase.length > 200 ? `${titleBase.slice(0, 197)}...` : titleBase;
    const content = `${message}\n\n---\n작성자: ${name}\n연락처: ${phone}\n이메일: ${email}`;
    const contact = `${phone} / ${email}`.slice(0, 100);

    startTransition(async () => {
      try {
        await createInquiry({
          title,
          content,
          contact,
        });
        router.push("/support/history");
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : "문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.";
        setSubmitError(msg);
      }
    });
  };

  const isSubmittable =
    form.name.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.message.trim() &&
    form.agreeTerms &&
    form.agreePrivacy;

  return (
    <div className="bg-white pb-16 pb-12">
      {/* 히어로 — Figma 215px, gradient */}
      <section
        className="flex flex-col items-center min-h-[182px] md:min-h-[215px] px-4 pb-8 max-md:pb-6 max-md:pt-12 md:pb-10 md:pt-[42px]"
        style={{ background: "var(--gradient-inquiry-hero)" }}
        aria-label="문의 페이지 소개"
      >
        <Image
          src={InquiryTitleMobile}
          alt="문의하기"
          width={97}
          height={38}
          sizes="97px"
          className="max-md:block max-md:w-[97px] md:hidden"
          priority
        />
        <Image
          src={InquiryTitle}
          alt="문의하기"
          width={110}
          height={40}
          className="max-md:hidden md:block md:h-auto md:w-[110px]"
          priority
        />
        <p
          className="mt-4 md:mt-8 max-w-[345px] text-center text-body-16-r leading-5 tracking-[-0.02em] text-[var(--color-text)]"
          style={{
            fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
          }}
        >
          궁금한 사항이 있으시면 상세히 안내해 드리겠습니다.
        </p>
      </section>

      {/* 카드 — Figma 1013×632, shadow, 카드가 히어로와 살짝 겹침 */}
      <div className="relative z-10 mx-auto w-full max-w-[1013px] px-4 max-md:px-4 md:px-8">
        <form
          onSubmit={handleSubmit}
          className="max-md:-mt-12 rounded-[20px] bg-white px-5 py-10 shadow-[0px_4px_24px_rgba(0,0,0,0.08)] max-md:py-8 md:-mt-[50px] md:px-8 md:py-12"
        >
          <div className="mx-auto flex w-full max-w-[718px] flex-col gap-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-y-6 max-md:gap-y-6 md:grid-cols-2 md:gap-x-[26px]">
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="name" className={labelClass}>
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="이름"
                  value={form.name}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="phone" className={labelClass}>
                  답변받을 연락처
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="답변받을 연락처"
                  value={form.phone}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-y-6 max-md:gap-y-6 md:grid-cols-2 md:gap-x-[26px]">
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="email" className={labelClass}>
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="이메일"
                  value={form.email}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <span id="file-label" className={labelClass}>
                  첨부파일
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`${fieldClass} flex items-center gap-1 text-left`}
                  aria-labelledby="file-label"
                >
                  <PaperclipIcon />
                  <span className="truncate text-[var(--color-text-secondary)]">
                    {form.fileName || "200MB 이하 파일"}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  aria-label="파일 첨부"
                />
                <p className="text-body-12-r leading-4 text-[var(--color-text-secondary)]">
                  첨부 파일 URL 업로드는 준비 중입니다. 접수 시 본문에 필요한 내용을 적어 주세요.
                </p>
              </div>
            </div>

            {/* 문의내용 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className={labelClass}>
                문의내용
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="문의 내용을 작성해주세요"
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="min-h-[124px] w-full resize-none rounded-2xl bg-[var(--color-surface-light)] px-5 py-3 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0"
              />
            </div>

            {/* 동의 — SVG 토글(체크/미체크), 숨김 checkbox + label 연동 */}
            <div className="flex flex-col gap-4">
              <label
                htmlFor="inquiry-agree-terms"
                className="flex cursor-pointer flex-wrap items-center gap-2"
              >
                <input
                  id="inquiry-agree-terms"
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={() => handleCheckbox("agreeTerms")}
                  className="sr-only"
                />
                <span className="shrink-0" aria-hidden>
                  {form.agreeTerms ? <ConsentCheckboxChecked /> : <ConsentCheckboxUnchecked />}
                </span>
                <span className="text-body-13-m leading-4 text-[var(--color-text)]">
                  이용약관에 동의합니다.
                </span>
                <Link
                  href="/terms"
                  className="text-body-13-r leading-4 text-[var(--color-text-secondary)] underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  전체보기
                </Link>
              </label>

              <label
                htmlFor="inquiry-agree-privacy"
                className="flex cursor-pointer flex-wrap items-center gap-2"
              >
                <input
                  id="inquiry-agree-privacy"
                  type="checkbox"
                  checked={form.agreePrivacy}
                  onChange={() => handleCheckbox("agreePrivacy")}
                  className="sr-only"
                />
                <span className="shrink-0" aria-hidden>
                  {form.agreePrivacy ? <ConsentCheckboxChecked /> : <ConsentCheckboxUnchecked />}
                </span>
                <span className="text-body-13-m leading-4 text-[var(--color-text)]">
                  개인정보 수집 및 활용에 동의합니다.
                </span>
                <Link
                  href="/privacy"
                  className="text-body-13-r leading-4 text-[var(--color-text-secondary)] underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  전체보기
                </Link>
              </label>
            </div>

            {submitError && (
              <p className="text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>
                {submitError}
              </p>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={!isSubmittable || isPending}
                className="inline-flex h-12 w-full max-w-[380px] items-center justify-center rounded-[30px] bg-[var(--color-accent)] px-6 py-[13px] text-subtitle-18-sb leading-[150%] tracking-[-0.02em] text-white disabled:opacity-50"
              >
                {isPending ? "접수 중…" : "제출하기"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
