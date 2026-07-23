"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createInquiry } from "@/features/inquiry/api";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { PAGE_CONTENT_WRAPPER_CLASS } from "@/shared/config/layout";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import TermsViewModal from "@/shared/ui/custom-modals/TermsViewModal";
import { getAttachmentPresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { digitsOnly, formatPhoneNumber, isValidKoreanPhone } from "@/shared/lib/format";
import { SupportHero } from "@/widgets/support/shared";

const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 200;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENTS = 2;
const ACCEPT_ATTACHMENT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf";

interface FormState {
  title: string;
  content: string;
  contact: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

const fieldClass =
  "h-10 w-full rounded-[8px] bg-[var(--color-surface-light)] px-5 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]";

const labelClass =
  "text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80";

const textareaClass =
  "min-h-[124px] w-full resize-none rounded-[8px] bg-[var(--color-surface-light)] px-5 py-3 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]";

const submitButtonClass =
  "inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] px-6 py-[13px] text-body-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 disabled:opacity-50";

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
  const { isLoggedIn } = useAuth();
  const { openAlert } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>({
    title: "",
    content: "",
    contact: "",
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [termsModal, setTermsModal] = useState<"terms" | "privacy" | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login?next=/inquiry");
    }
  }, [isLoggedIn, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (field: "agreeTerms" | "agreePrivacy") => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactError(null);
    setForm((prev) => ({ ...prev, contact: formatPhoneNumber(digitsOnly(e.target.value)) }));
  };

  const handleContactBlur = () => {
    const raw = digitsOnly(form.contact);
    if (raw && !isValidKoreanPhone(raw)) {
      setContactError("올바른 전화번호 형식이 아닙니다.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    if (attachedFiles.length + files.length > MAX_ATTACHMENTS) {
      openAlert({ type: "info", title: `첨부파일은 최대 ${MAX_ATTACHMENTS}개까지 첨부할 수 있습니다.` });
      return;
    }

    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        openAlert({ type: "info", title: "첨부파일은 5MB 이하만 업로드할 수 있습니다." });
        return;
      }
      if (file.type && !ACCEPT_ATTACHMENT.split(",").includes(file.type)) {
        openAlert({ type: "info", title: "이미지(JPG, PNG, WebP, GIF) 또는 PDF 파일만 첨부할 수 있습니다." });
        return;
      }
    }

    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content || !form.agreeTerms || !form.agreePrivacy) return;

    const contactDigits = digitsOnly(form.contact);
    if (contactDigits && !isValidKoreanPhone(contactDigits)) {
      setContactError("올바른 전화번호 형식이 아닙니다.");
      return;
    }

    const contact = form.contact.trim().slice(0, 100) || undefined;

    startTransition(async () => {
      try {
        let attachmentUrls: string[] | undefined;
        if (attachedFiles.length > 0) {
          attachmentUrls = await Promise.all(
            attachedFiles.map(async (file) => {
              const { uploadUrl, fileUrl } = await getAttachmentPresignedUrl({
                fileName: file.name,
                fileType: file.type || "application/octet-stream",
              });
              await uploadToS3(uploadUrl, file, file.type || "application/octet-stream");
              return fileUrl;
            }),
          );
        }

        await createInquiry({ title, content, contact, attachmentUrls });
        router.push("/support/history");
      } catch (err) {
        openAlert({
          title: getErrorMessage(err, "문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요."),
        });
      }
    });
  };

  const isSubmittable =
    form.title.trim() &&
    form.content.trim() &&
    form.agreeTerms &&
    form.agreePrivacy &&
    !contactError;

  if (!isLoggedIn) return null;

  return (
    <>
    {termsModal && (
      <TermsViewModal
        type={termsModal}
        onClose={() => setTermsModal(null)}
        onConfirm={() => setForm((prev) => ({ ...prev, [termsModal === "terms" ? "agreeTerms" : "agreePrivacy"]: true }))}
      />
    )}
    <div className="bg-white">
      <SupportHero />

      {/* 폼 영역 */}
      <div className={`${PAGE_CONTENT_WRAPPER_CLASS} max-md:py-6 md:pb-10`}>
        <form onSubmit={handleSubmit}>
          <div className="rounded-[20px] bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.08)]">
            {/* 뒤로가기 — 카드 상단 여백 왼쪽, 세로 중앙 */}
            <div className="flex items-center px-5 py-6 max-md:min-h-[56px] md:min-h-[94px] md:px-11 md:py-0 lg:px-11">
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-body-20-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 6L9 12L15 18" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>문의하기</span>
              </Link>
            </div>

          <div className="mx-auto flex w-full max-w-[718px] flex-col gap-3 px-5 pb-10 max-md:pb-8 md:px-8 md:pb-12 lg:px-8 lg:pb-12">
            {/* 제목 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className={labelClass}>
                제목
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="문의 제목을 작성해주세요"
                value={form.title}
                onChange={handleChange}
                maxLength={MAX_TITLE_LENGTH}
                className={fieldClass}
              />
              <p className="self-end text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80">
                {form.title.length}/{MAX_TITLE_LENGTH}
              </p>
            </div>

            {/* 문의내용 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="content" className={labelClass}>
                문의내용
              </label>
              <textarea
                id="content"
                name="content"
                placeholder="문의 내용을 작성해주세요"
                value={form.content}
                onChange={handleChange}
                rows={7}
                maxLength={MAX_CONTENT_LENGTH}
                className={textareaClass}
              />
              <p className="self-end text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80">
                {form.content.length}/{MAX_CONTENT_LENGTH}
              </p>
            </div>

            {/* 첨부파일 + 연락처 */}
            <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 lg:grid-cols-2 md:gap-x-[26px] lg:gap-x-[26px]">
              <div className="flex min-w-0 flex-col gap-2">
                <span id="file-label" className={labelClass}>
                  첨부파일
                </span>
                {attachedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className={`${fieldClass} flex items-center gap-1`}>
                    <PaperclipIcon />
                    <span className="min-w-0 flex-1 truncate text-[var(--color-text)]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isPending}
                      aria-label={`${file.name} 삭제`}
                      className="ml-1 shrink-0 text-body-13-m text-[var(--color-text-secondary)] hover:text-[var(--color-text)] disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                {attachedFiles.length < MAX_ATTACHMENTS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`${fieldClass} flex items-center gap-1 text-left`}
                    aria-labelledby="file-label"
                    disabled={isPending}
                  >
                    <PaperclipIcon />
                    <span className="truncate text-[var(--color-text-secondary)]">
                      5MB 이하 파일
                    </span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTACHMENT}
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                  aria-label="파일 첨부"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="contact" className={labelClass}>
                  연락처 (선택사항)
                </label>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  inputMode="numeric"
                  placeholder="010-0000-0000"
                  value={form.contact}
                  onChange={handleContactChange}
                  onBlur={handleContactBlur}
                  className={fieldClass}
                />
                {contactError && (
                  <p className="text-body-13-m text-red-600 pl-1" role="alert">{contactError}</p>
                )}
              </div>
            </div>

            {/* 동의 + 제출 — 태블릿·데스크탑 전용 */}
            <div className="max-md:hidden">
              <div className="flex flex-col gap-3 lg:mt-8">
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
                  <span className="text-body-13-m leading-4 text-[var(--color-text-emphasis)]">
                    이용약관에 동의합니다.
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setTermsModal("terms"); }}
                    className="text-body-13-r leading-4 text-[var(--color-text-secondary)] underline underline-offset-2"
                  >
                    전체보기
                  </button>
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
                  <span className="text-body-13-m leading-4 text-[var(--color-text-emphasis)]">
                    개인정보 제공 및 활용에 동의합니다.
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setTermsModal("privacy"); }}
                    className="text-body-13-r leading-4 text-[var(--color-text-secondary)] underline underline-offset-2"
                  >
                    전체보기
                  </button>
                </label>
              </div>
              <div className="flex justify-center max-md:pt-2 md:pt-5 lg:pt-[26px]">
                <button
                  type="submit"
                  disabled={!isSubmittable || isPending}
                  className={submitButtonClass}
                >
                  {isPending ? (attachedFiles.length > 0 ? "업로드 중…" : "접수 중…") : "제출하기"}
                </button>
              </div>
            </div>
          </div>
          </div>

        {/* 동의 + 제출 — 모바일 전용 (카드 바깥) */}
        <div className="md:hidden px-5 pt-6 pb-4">
          <div className="flex flex-col gap-8">
            <label
              htmlFor="mobile-inquiry-agree-terms"
              className="flex cursor-pointer flex-wrap items-center gap-2"
            >
              <input
                id="mobile-inquiry-agree-terms"
                type="checkbox"
                checked={form.agreeTerms}
                onChange={() => handleCheckbox("agreeTerms")}
                className="sr-only"
              />
              <span className="shrink-0" aria-hidden>
                {form.agreeTerms ? <ConsentCheckboxChecked /> : <ConsentCheckboxUnchecked />}
              </span>
              <span className="text-body-13-m leading-4 text-[var(--color-text-emphasis)]">
                이용약관에 동의합니다.
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setTermsModal("terms"); }}
                className="text-body-13-r leading-4 text-[var(--color-text-secondary)] underline underline-offset-2"
              >
                전체보기
              </button>
            </label>

            <label
              htmlFor="mobile-inquiry-agree-privacy"
              className="flex cursor-pointer flex-wrap items-center gap-2"
            >
              <input
                id="mobile-inquiry-agree-privacy"
                type="checkbox"
                checked={form.agreePrivacy}
                onChange={() => handleCheckbox("agreePrivacy")}
                className="sr-only"
              />
              <span className="shrink-0" aria-hidden>
                {form.agreePrivacy ? <ConsentCheckboxChecked /> : <ConsentCheckboxUnchecked />}
              </span>
              <span className="text-body-13-m leading-4 text-[var(--color-text-emphasis)]">
                개인정보 제공 및 활용에 동의합니다.
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setTermsModal("privacy"); }}
                className="text-body-13-r leading-4 text-[var(--color-text-secondary)] underline underline-offset-2"
              >
                전체보기
              </button>
            </label>
          </div>
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={!isSubmittable || isPending}
              className={submitButtonClass}
            >
              {isPending ? (attachedFiles.length > 0 ? "업로드 중…" : "접수 중…") : "제출하기"}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
    </>
  );
}
