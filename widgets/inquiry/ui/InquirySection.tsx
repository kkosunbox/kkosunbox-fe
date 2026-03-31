"use client";

import { useState, useRef } from "react";
import { Text } from "@/shared/ui";

interface FormState {
  name: string;
  phone: string;
  email: string;
  message: string;
  fileName: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

export default function InquirySection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    message: "",
    fileName: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    // TODO: 실제 제출 로직 연동
    alert("문의가 접수되었습니다. 빠르게 답변 드리겠습니다.");
  };

  const isSubmittable =
    form.name.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.message.trim() &&
    form.agreeTerms &&
    form.agreePrivacy;

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: "var(--gradient-inquiry-bg)" }}
    >
      {/* Page header */}
      <section className="pt-12 pb-8 text-center px-6">
        <Text
          as="h1"
          variant="title-24-b"
          className="text-[var(--color-primary)]"
        >
          문의하기
        </Text>
        <Text
          variant="body-16-r"
          className="mt-2 text-[var(--color-text-secondary)]"
        >
          우리 강아지가 꼬순박스만 오면 현관문 앞에서 기다려요!
        </Text>
      </section>

      <div className="mx-auto max-w-[720px] px-4 md:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white px-8 py-10 shadow-[0_4px_32px_rgba(0,0,0,0.06)] md:px-12"
        >
          {/* Row 1: 이름 / 연락처 */}
          <div className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-body-14-m text-[var(--color-text)]"
              >
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="이름"
                value={form.name}
                onChange={handleChange}
                className="rounded-lg border border-[var(--color-text-muted)] px-4 py-3 text-body-14-r text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-body-14-m text-[var(--color-text)]"
              >
                연락처
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="답변받을 연락처"
                value={form.phone}
                onChange={handleChange}
                className="rounded-lg border border-[var(--color-text-muted)] px-4 py-3 text-body-14-r text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Row 2: 이메일 / 첨부파일 */}
          <div className="mt-4 grid gap-4 max-md:grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-body-14-m text-[var(--color-text)]"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="이메일"
                value={form.email}
                onChange={handleChange}
                className="rounded-lg border border-[var(--color-text-muted)] px-4 py-3 text-body-14-r text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-body-14-m text-[var(--color-text)]">
                첨부파일
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-text-muted)] px-4 py-3 text-body-14-r text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] text-left"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M13.5 8.5V12a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 12V4A1.5 1.5 0 014 2.5h3.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 2l4 4-4 4M14 6H9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="truncate">
                  {form.fileName || "200MB 이하 파일"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                aria-label="파일 첨부"
              />
            </div>
          </div>

          {/* Row 3: 문의내용 */}
          <div className="mt-4 flex flex-col gap-1.5">
            <label
              htmlFor="message"
              className="text-body-14-m text-[var(--color-text)]"
            >
              문의내용
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="문의 내용을 작성해주세요"
              value={form.message}
              onChange={handleChange}
              rows={6}
              className="resize-none rounded-lg border border-[var(--color-text-muted)] px-4 py-3 text-body-14-r text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Checkboxes */}
          <div className="mt-6 flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={() => handleCheckbox("agreeTerms")}
                className="h-5 w-5 cursor-pointer rounded accent-[var(--color-accent)]"
              />
              <span className="text-body-14-r text-[var(--color-text)]">
                이용약관에 동의합니다.
              </span>
              <button
                type="button"
                className="text-body-14-r text-[var(--color-text-secondary)] underline ml-auto"
              >
                전체보기
              </button>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.agreePrivacy}
                onChange={() => handleCheckbox("agreePrivacy")}
                className="h-5 w-5 cursor-pointer rounded accent-[var(--color-accent)]"
              />
              <span className="text-body-14-r text-[var(--color-text)]">
                개인정보 재공 및 활용에 동의합니다.
              </span>
              <button
                type="button"
                className="text-body-14-r text-[var(--color-text-secondary)] underline ml-auto"
              >
                전체보기
              </button>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isSubmittable}
            className="mt-8 w-full rounded-full bg-[var(--color-accent)] py-4 text-[16px] font-semibold leading-[24px] tracking-[-0.02em] text-white disabled:opacity-50"
          >
            제출하기
          </button>
        </form>
      </div>
    </div>
  );
}
