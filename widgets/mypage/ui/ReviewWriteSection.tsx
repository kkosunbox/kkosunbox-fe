"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createReview, getMyReviews, updateReview } from "@/features/review/api";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { FeedbackFormLayout } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { getReviewImagePresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { trackReviewSubmit } from "@/shared/lib/analytics";
import { SupportHero } from "@/widgets/support/shared";

const MAX_CONTENT_LENGTH = 500;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENTS = 5; // 사진 최대 첨부 개수
// 백엔드 review-image presigned-url이 허용하는 확장자: jpg, jpeg, png, webp (gif 미지원)
const ACCEPT_ATTACHMENT = "image/jpeg,image/png,image/webp";

/** 첨부 이미지 — 기존(업로드 완료된 URL) 또는 신규(업로드 대기 File) */
type Attachment =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File };

function attachmentLabel(att: Attachment): string {
  if (att.kind === "new") return att.file.name;
  return decodeURIComponent(att.url.split("/").pop()?.split("?")[0] ?? "첨부 이미지");
}

const NOTICES = [
  "작성하신 리뷰는 서비스 홍보를 위해 활용될 수 있습니다.",
  "부적절한 내용(비방, 욕설, 광고 등)은 관리자에 의해 미노출될 수 있습니다.",
  "개인정보 보호를 위해 전화번호나 주소 등의 기재는 자제 부탁드립니다.",
];

const labelClass =
  "text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80";

const textareaClass =
  "min-h-[124px] w-full resize-none rounded-[8px] border border-[var(--color-text-muted)] bg-white px-5 py-3 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-cta-button)]";

const fieldClass =
  "h-10 w-full rounded-[8px] border border-[var(--color-text-muted)] bg-white px-5 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-cta-button)]";

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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L14.9 8.6L22 9.3L16.8 14L18.4 21L12 17.3L5.6 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
        fill={filled ? "var(--color-star)" : "var(--color-border-light)"}
      />
    </svg>
  );
}

function StarRating({
  rating,
  onChange,
  disabled,
}: {
  rating: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="별점">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={rating === value}
          aria-label={`별점 ${value}점`}
          onClick={() => onChange(value)}
          disabled={disabled}
          className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
        >
          <StarIcon filled={value <= rating} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewWriteSection({
  planId,
  productId,
  reviewId = null,
}: {
  planId: number | null;
  productId: number | null;
  reviewId?: number | null;
}) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { openAlert } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  /** 첨부 이미지 목록 — 최대 MAX_ATTACHMENTS개 (기존 URL + 신규 파일 혼합) */
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const isEditMode = reviewId != null;
  const [isLoadingReview, setIsLoadingReview] = useState(isEditMode);

  const targetQuery = planId ? `planId=${planId}` : productId ? `productId=${productId}` : "";
  const reviewWriteHref = targetQuery
    ? `/mypage/review/write?${targetQuery}${isEditMode ? `&reviewId=${reviewId}` : ""}`
    : "/mypage/review/write";

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(`/login?next=${encodeURIComponent(reviewWriteHref)}`);
    }
  }, [isLoggedIn, reviewWriteHref, router]);

  // 수정 모드 — 기존 리뷰 내용 프리필
  useEffect(() => {
    if (!isLoggedIn || !isEditMode) return;
    let cancelled = false;

    (async () => {
      try {
        const { items } = await getMyReviews();
        const target = items.find((r) => r.id === reviewId);
        if (cancelled) return;
        if (!target) {
          openAlert({ title: "수정할 리뷰를 찾을 수 없습니다." });
          router.replace("/mypage");
          return;
        }
        setContent(target.content);
        setRating(Math.round(target.rating));
        setAttachments(
          (target.imageUrls ?? []).map((url) => ({ kind: "existing", url })),
        );
      } catch (err) {
        if (cancelled) return;
        openAlert({ title: getErrorMessage(err, "리뷰 정보를 불러오지 못했습니다.") });
        router.replace("/mypage");
      } finally {
        if (!cancelled) setIsLoadingReview(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // reviewId/로그인 변경 시에만 재실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isEditMode, reviewId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      openAlert({ type: "info", title: `사진은 최대 ${MAX_ATTACHMENTS}장까지 첨부할 수 있습니다.` });
      return;
    }

    const accepted: Attachment[] = [];
    let rejectedSize = false;
    let rejectedType = false;
    const acceptList = ACCEPT_ATTACHMENT.split(",");

    for (const file of files) {
      if (accepted.length >= remaining) break;
      if (file.size > MAX_ATTACHMENT_BYTES) {
        rejectedSize = true;
        continue;
      }
      if (file.type && !acceptList.includes(file.type)) {
        rejectedType = true;
        continue;
      }
      accepted.push({ kind: "new", file });
    }

    if (accepted.length > 0) {
      setAttachments((prev) => [...prev, ...accepted]);
    }

    // 거절 사유 안내 (한 번에 하나만 노출)
    if (files.length > remaining) {
      openAlert({ type: "info", title: `사진은 최대 ${MAX_ATTACHMENTS}장까지 첨부할 수 있습니다.` });
    } else if (rejectedSize) {
      openAlert({ type: "info", title: "사진은 5MB 이하만 업로드할 수 있습니다." });
    } else if (rejectedType) {
      openAlert({ type: "info", title: "이미지(JPG, PNG, WebP, GIF) 파일만 첨부할 수 있습니다." });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();

    if (isEditMode ? reviewId == null : (!planId && !productId)) {
      openAlert({ title: "리뷰를 작성할 상품 정보를 찾을 수 없습니다." });
      return;
    }
    if (rating < 1) {
      openAlert({ type: "info", title: "별점을 선택해주세요." });
      return;
    }
    if (!trimmed) {
      openAlert({ type: "info", title: "리뷰 내용을 작성해주세요." });
      return;
    }

    startTransition(async () => {
      try {
        // 첨부 이미지 결정: 신규 파일은 업로드 후 URL로, 기존 URL은 그대로 — 순서 유지
        let imageUrls: string[] | null | undefined;
        if (attachments.length > 0) {
          const urls: string[] = [];
          for (const att of attachments) {
            if (att.kind === "existing") {
              urls.push(att.url);
              continue;
            }
            const fileType = att.file.type || "application/octet-stream";
            const { uploadUrl, fileUrl } = await getReviewImagePresignedUrl({
              fileName: att.file.name,
              fileType,
            });
            await uploadToS3(uploadUrl, att.file, fileType);
            urls.push(fileUrl);
          }
          imageUrls = urls;
        } else {
          imageUrls = isEditMode ? null : undefined;
        }

        if (isEditMode && reviewId != null) {
          await updateReview(reviewId, { rating, content: trimmed, imageUrls });
          trackReviewSubmit({ rating });
          openAlert({
            type: "success",
            title: "리뷰가 수정되었습니다.",
            description: "소중한 리뷰를 남겨주셔서 감사합니다.",
          });
        } else if (planId || productId) {
          await createReview({
            ...(planId ? { planId } : { productId: productId! }),
            rating,
            content: trimmed,
            imageUrls: imageUrls ?? undefined,
          });
          trackReviewSubmit({ rating });
          openAlert({
            type: "success",
            title: "리뷰가 등록되었습니다.",
            description: "소중한 리뷰를 남겨주셔서 감사합니다.",
          });
        }

        router.push("/mypage");
        router.refresh();
      } catch (err) {
        openAlert({
          title: getErrorMessage(
            err,
            isEditMode
              ? "리뷰 수정에 실패했습니다. 잠시 후 다시 시도해 주세요."
              : "리뷰 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          ),
        });
      }
    });
  };

  const canAddMore = attachments.length < MAX_ATTACHMENTS;
  const hasNewUpload = attachments.some((att) => att.kind === "new");

  const isSubmittable =
    (isEditMode ? reviewId != null : !!(planId || productId)) &&
    rating >= 1 &&
    content.trim().length > 0;

  const pageTitle = isEditMode ? "리뷰 수정" : "리뷰쓰기";
  const submitLabel = isEditMode ? "수정하기" : "제출하기";

  if (!isLoggedIn) return null;

  return (
    <div className="bg-white">
      <SupportHero label="리뷰 작성 안내">꼬순박스 이용 후 솔직한 리뷰 작성하기</SupportHero>
      {isLoadingReview ? (
        <div className="flex min-h-[795px] items-center justify-center">
          <p className="text-body-14-m text-[var(--color-text-secondary)]">리뷰 정보를 불러오는 중…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <FeedbackFormLayout
            title={pageTitle}
            backHref="/mypage"
            introTitle="솔직한 꼬순박스 후기는 더 안전하고 맛있는 영양 간식을 만드는 데 큰 도움이 됩니다."
            introDescription={<ul>{NOTICES.map((notice) => <li key={notice}>{notice}</li>)}</ul>}
            action={
              <button type="submit" disabled={!isSubmittable || isPending} className={submitButtonClass}>
                {isPending ? (hasNewUpload ? "업로드 중…" : isEditMode ? "수정 중…" : "등록 중…") : submitLabel}
              </button>
            }
          >
            <div className="mt-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className={labelClass}>별점</span>
                <StarRating rating={rating} onChange={setRating} disabled={isPending} />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="review-content" className={labelClass}>상세리뷰</label>
                <textarea id="review-content" placeholder="꼬순박스의 상세한 리뷰를 작성해주세요." value={content} onChange={(event) => setContent(event.target.value)} rows={7} maxLength={MAX_CONTENT_LENGTH} className={textareaClass} />
                <p className="self-end text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80">{content.length}/{MAX_CONTENT_LENGTH}</p>
              </div>

              <div className="flex w-full max-w-[346px] min-w-0 flex-col gap-2 max-md:max-w-none">
                <span id="review-file-label" className={labelClass}>첨부파일</span>
                {attachments.map((attachment, index) => {
                  const name = attachmentLabel(attachment);
                  return (
                    <div key={attachment.kind === "existing" ? attachment.url : `${attachment.file.name}-${index}`} className={`${fieldClass} flex items-center gap-1`}>
                      <PaperclipIcon />
                      <span className="min-w-0 flex-1 truncate text-[var(--color-text)]">{name}</span>
                      <button type="button" onClick={() => handleRemoveAttachment(index)} disabled={isPending} aria-label={`${name} 삭제`} className="ml-1 shrink-0 text-body-13-m text-[var(--color-text-secondary)] hover:text-[var(--color-text)] disabled:opacity-50">삭제</button>
                    </div>
                  );
                })}
                {canAddMore && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className={`${fieldClass} flex items-center gap-1 text-left`} aria-labelledby="review-file-label" disabled={isPending}>
                    <PaperclipIcon /><span className="truncate text-[var(--color-text-secondary)]">5MB 이하 파일</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept={ACCEPT_ATTACHMENT} multiple className="sr-only" onChange={handleFileChange} aria-label="사진 첨부" />
              </div>
            </div>
          </FeedbackFormLayout>
        </form>
      )}
    </div>
  );
}
