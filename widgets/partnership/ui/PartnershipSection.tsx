"use client";

import { Fragment, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { createPartnershipInquiry } from "@/features/partnership-inquiry";
import { PAGE_CONTENT_WRAPPER_CLASS } from "@/shared/config/layout";
import { EMAIL_MAX_LENGTH } from "@/shared/config/inputLimits";
import { getPartnershipInquiryPresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { digitsOnly, formatPhoneNumber, isValidKoreanPhone } from "@/shared/lib/format";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { PartnershipHero } from "./PartnershipHero";

const MAX_COMPANY_NAME_LENGTH = 100;
const MAX_CONTACT_NAME_LENGTH = 50;
const MAX_CONTENT_LENGTH = 2000;
const MAX_ATTACHMENT_BYTES = 30 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;
const MAX_REFERENCE_LINKS = 10;
const MAX_REFERENCE_LINK_LENGTH = 2048;
const ACCEPT_ATTACHMENT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getReferenceLinkError(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;
  if (trimmedValue.length > MAX_REFERENCE_LINK_LENGTH) {
    return `참고링크는 ${MAX_REFERENCE_LINK_LENGTH.toLocaleString()}자 이하로 입력해주세요.`;
  }

  try {
    const url = new URL(trimmedValue);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    return "http:// 또는 https://로 시작하는 올바른 링크를 입력해주세요.";
  }
  return undefined;
}

interface PartnershipFormState {
  companyName: string;
  managerName: string;
  contact: string;
  email: string;
  content: string;
}

type PartnershipFormErrors = Partial<Record<keyof PartnershipFormState, string>>;

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

function InlineFieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="pl-1 text-body-13-m text-red-600" role="alert">
      {message}
    </p>
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
  const [referenceLinkErrors, setReferenceLinkErrors] = useState<(string | undefined)[]>([]);
  const [fieldErrors, setFieldErrors] = useState<PartnershipFormErrors>({});

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace("/login?next=/partnership");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof PartnershipFormState;
    setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldErrors((prev) => ({ ...prev, contact: undefined }));
    setForm((prev) => ({
      ...prev,
      contact: formatPhoneNumber(digitsOnly(event.target.value)),
    }));
  };

  const getFieldError = (name: keyof PartnershipFormState, value: string) => {
    if (!value.trim()) {
      const requiredMessages: Record<keyof PartnershipFormState, string> = {
        companyName: "회사 / 브랜드명을 작성해주세요.",
        managerName: "담당자명 / 직급을 작성해주세요.",
        contact: "연락처를 작성해주세요.",
        email: "이메일을 작성해주세요.",
        content: "문의내용을 작성해주세요.",
      };
      return requiredMessages[name];
    }

    if (name === "contact" && !isValidKoreanPhone(digitsOnly(value))) {
      return "올바른 전화번호 형식이 아닙니다.";
    }
    if (name === "email" && value.trim().length > EMAIL_MAX_LENGTH) {
      return `이메일은 ${EMAIL_MAX_LENGTH}자 이하로 작성해주세요.`;
    }
    if (name === "email" && !EMAIL_PATTERN.test(value.trim())) {
      return "올바른 이메일 형식이 아닙니다.";
    }
    return undefined;
  };

  const handleFieldBlur = (name: keyof PartnershipFormState) => {
    setFieldErrors((prev) => ({ ...prev, [name]: getFieldError(name, form[name]) }));
  };

  const validateForm = () => {
    const errors = (Object.keys(form) as (keyof PartnershipFormState)[]).reduce(
      (nextErrors, name) => {
        const error = getFieldError(name, form[name]);
        if (error) nextErrors[name] = error;
        return nextErrors;
      },
      {} as PartnershipFormErrors,
    );
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
        openAlert({ type: "info", title: "첨부파일은 파일당 30MB 이하만 선택할 수 있습니다." });
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
    setReferenceLinkErrors((prev) => {
      const next = [...prev];
      next[index] = undefined;
      return next;
    });
    setReferenceLinks((prev) => {
      const next = [...prev];
      next[index] = value;
      if (value.trim() && index === next.length - 1 && next.length < MAX_REFERENCE_LINKS) {
        next.push("");
      }
      return next;
    });
  };

  const handleReferenceLinkBlur = (index: number) => {
    setReferenceLinkErrors((prev) => {
      const next = [...prev];
      next[index] = getReferenceLinkError(referenceLinks[index]);
      return next;
    });
  };

  const handleRemoveReferenceLink = (index: number) => {
    setReferenceLinkErrors((prev) => prev.filter((_, linkIndex) => linkIndex !== index));
    setReferenceLinks((prev) => {
      const next = prev.filter((_, linkIndex) => linkIndex !== index);
      if (next.length === 0) return [""];
      if (next.length < MAX_REFERENCE_LINKS && next.at(-1)?.trim()) next.push("");
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isFormValid = validateForm();
    const nextReferenceLinkErrors = referenceLinks.map(getReferenceLinkError);
    setReferenceLinkErrors(nextReferenceLinkErrors);
    if (!isFormValid || nextReferenceLinkErrors.some(Boolean)) return;

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
        setReferenceLinkErrors([]);
        setFieldErrors({});
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
        <form className="relative z-10" noValidate onSubmit={handleSubmit}>
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
                    onBlur={() => handleFieldBlur("companyName")}
                    aria-invalid={Boolean(fieldErrors.companyName)}
                    aria-describedby={fieldErrors.companyName ? "companyName-error" : undefined}
                    className={fieldClass}
                  />
                  <InlineFieldError id="companyName-error" message={fieldErrors.companyName} />
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
                    onBlur={() => handleFieldBlur("managerName")}
                    aria-invalid={Boolean(fieldErrors.managerName)}
                    aria-describedby={fieldErrors.managerName ? "managerName-error" : undefined}
                    className={fieldClass}
                  />
                  <InlineFieldError id="managerName-error" message={fieldErrors.managerName} />
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
                    onBlur={() => handleFieldBlur("contact")}
                    aria-invalid={Boolean(fieldErrors.contact)}
                    aria-describedby={fieldErrors.contact ? "partnership-contact-error" : undefined}
                    className={fieldClass}
                  />
                  <InlineFieldError
                    id="partnership-contact-error"
                    message={fieldErrors.contact}
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <RequiredLabel htmlFor="partnership-email">이메일</RequiredLabel>
                  <input
                    id="partnership-email"
                    name="email"
                    type="email"
                    required
                    maxLength={EMAIL_MAX_LENGTH}
                    placeholder="이메일을 작성해주세요"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("email")}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? "partnership-email-error" : undefined}
                    className={fieldClass}
                  />
                  <InlineFieldError id="partnership-email-error" message={fieldErrors.email} />
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
                      onBlur={() => handleFieldBlur("content")}
                      aria-invalid={Boolean(fieldErrors.content)}
                      aria-describedby={fieldErrors.content ? "partnership-content-error" : undefined}
                      className="h-[124px] w-full resize-none rounded-[8px] bg-[var(--color-surface-light)] px-5 py-3 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
                    />
                    <InlineFieldError
                      id="partnership-content-error"
                      message={fieldErrors.content}
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
                    <Fragment key={index}>
                      <div className={`${fieldClass} flex items-center gap-2`}>
                        <input
                          id={index === 0 ? "referenceLink" : `referenceLink-${index + 1}`}
                          name={`referenceLink-${index + 1}`}
                          type="url"
                          maxLength={MAX_REFERENCE_LINK_LENGTH}
                          placeholder="https://example.com"
                          value={link}
                          onChange={(event) => handleReferenceLinkChange(index, event.target.value)}
                          onBlur={() => handleReferenceLinkBlur(index)}
                          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--color-text-secondary)]"
                          aria-label={`참고링크 ${index + 1}`}
                          aria-invalid={Boolean(referenceLinkErrors[index])}
                          aria-describedby={referenceLinkErrors[index] ? `referenceLink-${index + 1}-error` : undefined}
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
                      <InlineFieldError
                        id={`referenceLink-${index + 1}-error`}
                        message={referenceLinkErrors[index]}
                      />
                    </Fragment>
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
