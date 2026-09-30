"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { createInquiry } from "@/features/inquiry/api";
import { getAttachmentPresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { FeedbackFormLayout } from "@/shared/ui";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { SupportHero } from "@/widgets/support/shared";

const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 200;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENTS = 2;
const ACCEPT_ATTACHMENT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

const fieldClass = "h-10 w-full rounded-[8px] border border-[var(--color-text-muted)] bg-white px-5 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-cta-button)]";
const labelClass = "text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80";
const textareaClass = "min-h-[124px] w-full resize-none rounded-[8px] border border-[var(--color-text-muted)] bg-white px-5 py-3 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-cta-button)]";
const submitButtonClass = "inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] px-6 py-[13px] text-body-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 disabled:opacity-50";

function PaperclipIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21.44 11.05l-9.19 9.19a4.5 4.5 0 01-6.364-6.364l9.19-9.19a3 3 0 114.243 4.242l-9.192 9.192a1.5 1.5 0 01-2.122-2.122L16.5 7.5" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InquirySection() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { openAlert } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ title: "", content: "" });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login?next=/inquiry");
  }, [isLoggedIn, router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
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
    setAttachedFiles((previous) => [...previous, ...files]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) return;

    startTransition(async () => {
      try {
        const attachmentUrls = attachedFiles.length > 0
          ? await Promise.all(attachedFiles.map(async (file) => {
              const fileType = file.type || "application/octet-stream";
              const { uploadUrl, fileUrl } = await getAttachmentPresignedUrl({ fileName: file.name, fileType });
              await uploadToS3(uploadUrl, file, fileType);
              return fileUrl;
            }))
          : undefined;
        await createInquiry({ title, content, attachmentUrls });
        router.push("/support/history");
      } catch (error) {
        openAlert({ title: getErrorMessage(error, "문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.") });
      }
    });
  };

  if (!isLoggedIn) return null;
  const isSubmittable = form.title.trim().length > 0 && form.content.trim().length > 0;

  return (
    <div className="bg-white">
      <SupportHero />
      <form onSubmit={handleSubmit}>
        <FeedbackFormLayout
          title="문의하기"
          backHref="/support"
          introTitle="서비스 이용 중 궁금한 점이나 문의하실 내용이 있다면 언제든 편하게 남겨주세요."
          introDescription={<><p>문의 접수 후 영업일 기준 1-2일 이내에 최대한 빠르게 답변을 드립니다.</p><p>긴급한 서비스 장애나 빠른 상담이 필요하신 경우, <strong className="font-bold underline">카카오톡 1:1 상담</strong>을 이용하시면 보다 신속하게 안내받으실 수 있습니다.</p></>}
          action={<button type="submit" disabled={!isSubmittable || isPending} className={submitButtonClass}>{isPending ? (attachedFiles.length > 0 ? "업로드 중…" : "접수 중…") : "제출하기"}</button>}
        >
          <div className="mt-9">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className={labelClass}>제목</label>
              <input id="title" name="title" type="text" placeholder="문의 제목을 작성해주세요" value={form.title} onChange={handleChange} maxLength={MAX_TITLE_LENGTH} className={fieldClass} />
              <p className="self-end text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80">{form.title.length}/{MAX_TITLE_LENGTH}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="content" className={labelClass}>문의내용</label>
              <textarea id="content" name="content" placeholder="문의 내용을 작성해주세요" value={form.content} onChange={handleChange} rows={7} maxLength={MAX_CONTENT_LENGTH} className={textareaClass} />
              <p className="self-end text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80">{form.content.length}/{MAX_CONTENT_LENGTH}</p>
            </div>
            <div className="flex w-full max-w-[346px] min-w-0 flex-col gap-2 max-md:max-w-none">
              <span id="file-label" className={labelClass}>첨부파일</span>
              {attachedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className={`${fieldClass} flex items-center gap-1`}>
                  <PaperclipIcon />
                  <span className="min-w-0 flex-1 truncate text-[var(--color-text)]">{file.name}</span>
                  <button type="button" onClick={() => setAttachedFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index))} disabled={isPending} aria-label={`${file.name} 삭제`} className="ml-1 shrink-0 text-body-13-m text-[var(--color-text-secondary)] hover:text-[var(--color-text)] disabled:opacity-50">삭제</button>
                </div>
              ))}
              {attachedFiles.length < MAX_ATTACHMENTS && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className={`${fieldClass} flex items-center gap-1 text-left`} aria-labelledby="file-label" disabled={isPending}>
                  <PaperclipIcon /><span className="truncate text-[var(--color-text-secondary)]">5MB 이하 파일</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept={ACCEPT_ATTACHMENT} multiple className="sr-only" onChange={handleFileChange} aria-label="파일 첨부" />
            </div>
          </div>
        </FeedbackFormLayout>
      </form>
    </div>
  );
}
