"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { createPartnershipInquiry } from "@/features/partnership-inquiry";
import { PAGE_CONTENT_WRAPPER_CLASS } from "@/shared/config/layout";
import { getPartnershipInquiryPresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { digitsOnly, formatPhoneNumber, isValidKoreanPhone } from "@/shared/lib/format";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { PartnershipHero } from "./PartnershipHero";

const MAX_COMPANY_NAME_LENGTH = 100;
const MAX_CONTACT_NAME_LENGTH = 50;
const MAX_CONTENT_LENGTH = 2000;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;
const MAX_REFERENCE_LINKS = 10;
const ACCEPT_ATTACHMENT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf";

interface PartnershipFormState {
  companyName: string;
  managerName: string;
  contact: string;
  email: string;
  content: string;
}

const initialForm: PartnershipFormState = {
  companyName: "",
  managerName: "",
  contact: "",
  email: "",
  content: "",
};

const fieldClass =
  "h-10 w-full rounded-[8px] bg-[var(--color-surface-light)] px-5 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]";

const labelClass =
  "text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80";

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {children} <span className="text-[var(--color-stats-icon-blue)]">*</span>
    </label>
  );
}

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

export default function PartnershipSection() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoading } = useAuth();
  const { openAlert } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<PartnershipFormState>(initialForm);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [referenceLinks, setReferenceLinks] = useState([""]);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace("/login?next=/partnership");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContactError(null);
    setForm((prev) => ({
      ...prev,
      contact: formatPhoneNumber(digitsOnly(event.target.value)),
    }));
  };

  const handleContactBlur = () => {
    const rawContact = digitsOnly(form.contact);
    if (rawContact && !isValidKoreanPhone(rawContact)) {
      setContactError("올바른 전화번호 형식이 아닙니다.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      openAlert({ type: "info", title: `첨부파일은 최대 ${MAX_ATTACHMENTS}개까지 첨부할 수 있습니다.` });
      return;
    }

    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        openAlert({ type: "info", title: "첨부파일은 5MB 이하만 선택할 수 있습니다." });
        return;
      }
      if (file.type && !ACCEPT_ATTACHMENT.split(",").includes(file.type)) {
        openAlert({
          type: "info",
          title: "이미지(JPG, PNG, WebP, GIF) 또는 PDF 파일만 첨부할 수 있습니다.",
        });
        return;
      }
    }

    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleReferenceLinkChange = (index: number, value: string) => {
    setReferenceLinks((prev) => {
      const next = [...prev];
      next[index] = value;
      if (value.trim() && index === next.length - 1 && next.length < MAX_REFERENCE_LINKS) {
        next.push("");
      }
      return next;
    });
  };

  const handleRemoveReferenceLink = (index: number) => {
    setReferenceLinks((prev) => {
      const next = prev.filter((_, linkIndex) => linkIndex !== index);
      if (next.length === 0) return [""];
      if (next.length < MAX_REFERENCE_LINKS && next.at(-1)?.trim()) next.push("");
      return next;
    });
  };

  const isSubmittable =
    form.companyName.trim() &&
    form.managerName.trim() &&
    form.contact.trim() &&
    form.email.trim() &&
    form.content.trim() &&
    !contactError;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSubmittable) return;

    const companyName = form.companyName.trim();
    const contactName = form.managerName.trim();
    const content = form.content.trim();
    const email = form.email.trim();
    const phone = form.contact.trim();
    const normalizedReferenceLinks = referenceLinks
      .map((link) => link.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        let attachmentUrls: string[] | undefined;
        if (attachments.length > 0) {
          attachmentUrls = await Promise.all(
            attachments.map(async (file) => {
              const fileType = file.type || "application/octet-stream";
              const { uploadUrl, fileUrl } = await getPartnershipInquiryPresignedUrl({
                fileName: file.name,
                fileType,
              });
              await uploadToS3(uploadUrl, file, fileType);
              return fileUrl;
            }),
          );
        }

        await createPartnershipInquiry({
          companyName,
          contactName,
          content,
          email,
          phone,
          attachmentUrls,
          referenceLinks:
            normalizedReferenceLinks.length > 0 ? normalizedReferenceLinks : undefined,
        });

        setForm(initialForm);
        setAttachments([]);
        setReferenceLinks([""]);
        setContactError(null);
        openAlert({
          type: "success",
          title: "제휴·입점 문의가 접수되었습니다.",
          description: "담당자가 확인 후 입력하신 연락처로 안내드리겠습니다.",
        });
      } catch (error) {
        openAlert({
          title: getErrorMessage(
            error,
            "제휴·입점 문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          ),
        });
      }
    });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="bg-white">
      <PartnershipHero />

      <div
        className={`${PAGE_CONTENT_WRAPPER_CLASS} max-md:py-6 md:pt-0 md:pb-10 lg:pb-[64px]`}
      >
        <form onSubmit={handleSubmit}>
          <section
            className="flex rounded-[20px] bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.08)] max-md:min-h-0 max-md:flex-col md:min-h-[688px] md:flex-col"
            aria-labelledby="partnership-form-title"
          >
            <div className="flex max-md:min-h-[72px] max-md:items-center max-md:px-5 md:min-h-[94px] md:items-start md:px-11 md:pt-8">
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-body-20-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M15 6L9 12L15 18"
                    stroke="var(--color-text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span id="partnership-form-title">제휴·입점 문의</span>
              </Link>
            </div>

            <div className="mx-auto flex w-full max-w-[782px] flex-1 flex-col max-md:px-5 max-md:pb-8 md:px-8 md:pb-10">
              <div className="grid max-md:grid-cols-1 max-md:gap-y-4 md:grid-cols-2 md:gap-x-[26px] md:gap-y-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <RequiredLabel htmlFor="companyName">회사 / 브랜드명</RequiredLabel>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    maxLength={MAX_COMPANY_NAME_LENGTH}
                    placeholder="회사 / 브랜드명을 작성해주세요"
                    value={form.companyName}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <RequiredLabel htmlFor="managerName">담당자명 / 직급</RequiredLabel>
                  <input
                    id="managerName"
                    name="managerName"
                    type="text"
                    required
                    maxLength={MAX_CONTACT_NAME_LENGTH}
                    placeholder="담당자명 / 직급을 작성해주세요"
                    value={form.managerName}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <RequiredLabel htmlFor="partnership-contact">연락처</RequiredLabel>
                  <input
                    id="partnership-contact"
                    name="contact"
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={50}
                    placeholder="연락처를 작성해주세요"
                    value={form.contact}
                    onChange={handleContactChange}
                    onBlur={handleContactBlur}
                    className={fieldClass}
                  />
                  {contactError && (
                    <p className="pl-1 text-body-13-m text-red-600" role="alert">
                      {contactError}
                    </p>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <RequiredLabel htmlFor="partnership-email">이메일</RequiredLabel>
                  <input
                    id="partnership-email"
                    name="email"
                    type="email"
                    required
                    placeholder="이메일을 작성해주세요"
                    value={form.email}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </div>

                <div className="flex min-w-0 flex-col md:col-span-2">
                  <div className="flex flex-col gap-2">
                    <RequiredLabel htmlFor="partnership-content">문의내용</RequiredLabel>
                    <textarea
                      id="partnership-content"
                      name="content"
                      required
                      rows={7}
                      maxLength={MAX_CONTENT_LENGTH}
                      placeholder="문의 내용을 작성해주세요"
                      value={form.content}
                      onChange={handleChange}
                      className="h-[124px] w-full resize-none rounded-[8px] bg-[var(--color-surface-light)] px-5 py-3 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
                    />
                  </div>
                  <p className="mt-1 self-end text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80">
                    {form.content.length}/{MAX_CONTENT_LENGTH}
                  </p>
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <span id="partnership-file-label" className={labelClass}>
                    첨부파일
                  </span>
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${index}`} className={`${fieldClass} flex items-center gap-1`}>
                      <PaperclipIcon />
                      <span className="min-w-0 flex-1 truncate text-[var(--color-text)]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        disabled={isPending}
                        aria-label={`${file.name} 삭제`}
                        className="ml-1 shrink-0 text-body-13-m text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  {attachments.length < MAX_ATTACHMENTS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                      className={`${fieldClass} flex items-center gap-1 text-left`}
                      aria-labelledby="partnership-file-label"
                    >
                      <PaperclipIcon />
                      <span className="min-w-0 flex-1 truncate text-[var(--color-text-secondary)]">
                        사진 및 문서를 첨부해주세요
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
                    aria-label="제휴·입점 문의 파일 첨부"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <label htmlFor="referenceLink" className={labelClass}>
                    참고링크
                  </label>
                  {referenceLinks.map((link, index) => (
                    <div key={index} className={`${fieldClass} flex items-center gap-2`}>
                      <input
                        id={index === 0 ? "referenceLink" : `referenceLink-${index + 1}`}
                        name={`referenceLink-${index + 1}`}
                        type="url"
                        placeholder="링크를 입력해주세요"
                        value={link}
                        onChange={(event) => handleReferenceLinkChange(index, event.target.value)}
                        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--color-text-secondary)]"
                        aria-label={`참고링크 ${index + 1}`}
                      />
                      {link && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReferenceLink(index)}
                          disabled={isPending}
                          aria-label={`참고링크 ${index + 1} 삭제`}
                          className="shrink-0 text-body-13-m text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)] disabled:opacity-50"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex justify-center max-md:pt-10 md:pt-10">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] px-6 text-body-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isPending
                    ? attachments.length > 0
                      ? "업로드 중…"
                      : "접수 중…"
                    : "제출하기"}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
