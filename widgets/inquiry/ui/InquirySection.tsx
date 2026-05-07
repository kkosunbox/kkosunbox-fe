"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createInquiry } from "@/features/inquiry/api";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import TermsViewModal from "@/shared/ui/custom-modals/TermsViewModal";
import { getAttachmentPresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import InquiryTitle from "@/widgets/support/faq/assets/inquiry-title.webp";
import InquiryTitleMobile from "@/widgets/support/faq/assets/inquiry-title-mobile.webp";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    if (attachedFiles.length + files.length > MAX_ATTACHMENTS) {
      openAlert({ title: `첨부파일은 최대 ${MAX_ATTACHMENTS}개까지 첨부할 수 있습니다.` });
      return;
    }

    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        openAlert({ title: "첨부파일은 5MB 이하만 업로드할 수 있습니다." });
        return;
      }
      if (file.type && !ACCEPT_ATTACHMENT.split(",").includes(file.type)) {
        openAlert({ title: "이미지(JPG, PNG, WebP, GIF) 또는 PDF 파일만 첨부할 수 있습니다." });
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
    form.agreePrivacy;

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
      <div className="relative z-10 mx-auto w-full max-w-[1013px] px-4 max-md:px-4 md:px-0">
        <form
          onSubmit={handleSubmit}
          className="max-md:-mt-12 rounded-[20px] bg-white px-5 py-10 shadow-[0px_4px_24px_rgba(0,0,0,0.08)] max-md:py-8 md:-mt-[50px] md:px-8 md:py-12"
        >
          <div className="mx-auto flex w-full max-w-[718px] flex-col gap-6">
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
              <p className="self-end text-body-13-r leading-4 text-[var(--color-text-secondary)]">
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
                className="min-h-[160px] w-full resize-none rounded-2xl bg-[var(--color-surface-light)] px-5 py-3 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0"
              />
              <p className="self-end text-body-13-r leading-4 text-[var(--color-text-secondary)]">
                {form.content.length}/{MAX_CONTENT_LENGTH}
              </p>
            </div>

            {/* 첨부파일 + 연락처 */}
            <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-[26px]">
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
                      {`5MB 이하 파일 (최대 ${MAX_ATTACHMENTS}개)`}
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
                  placeholder="연락처를 작성해주세요"
                  value={form.contact}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
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
                <span className="text-body-13-m leading-4 text-[var(--color-text)]">
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

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={!isSubmittable || isPending}
                className="inline-flex h-12 w-full max-w-[380px] items-center justify-center rounded-[30px] bg-[var(--color-accent)] px-6 py-[13px] text-subtitle-18-sb leading-[150%] tracking-[-0.02em] text-white disabled:opacity-50"
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
