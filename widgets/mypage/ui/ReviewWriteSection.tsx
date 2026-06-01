"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createReview } from "@/features/review/api";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { PAGE_CONTENT_WRAPPER_CLASS } from "@/shared/config/layout";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { getAttachmentPresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import reviewWriteHeroDesktop from "../assets/review-write-hero-desktop.png";
import reviewWriteHeroMobile from "../assets/review-write-hero-mobile.png";

const HERO_ALT =
  "우리 아이의 꼬순박스, 만족하셨나요? 남겨주신 리뷰는 더 나은 꼬순박스를 만드는 데 큰 힘이 됩니다.";

const MAX_CONTENT_LENGTH = 500;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPT_ATTACHMENT = "image/jpeg,image/png,image/webp,image/gif";

const NOTICES = [
  "작성하신 리뷰는 서비스 홍보를 위해 활용될 수 있습니다.",
  "부적절한 내용(비방, 욕설, 광고 등)은 관리자에 의해 미노출될 수 있습니다.",
  "개인정보 보호를 위해 전화번호나 주소 등의 기재는 자제 부탁드립니다.",
];

const labelClass =
  "text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80";

const textareaClass =
  "min-h-[124px] w-full resize-none rounded-[8px] bg-[var(--color-surface-light)] px-5 py-3 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]";

const fieldClass =
  "h-10 w-full rounded-[8px] bg-[var(--color-surface-light)] px-5 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]";

const submitButtonClass =
  "inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] px-6 py-[13px] text-body-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 disabled:opacity-50";

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
        fill={filled ? "var(--color-star)" : "var(--color-surface-warm)"}
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

export default function ReviewWriteSection({ planId }: { planId: number | null }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { openAlert } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      const next = planId
        ? `/mypage/review/write?planId=${planId}`
        : "/mypage/review/write";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isLoggedIn, planId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      openAlert({ type: "info", title: "사진은 5MB 이하만 업로드할 수 있습니다." });
      return;
    }
    if (file.type && !ACCEPT_ATTACHMENT.split(",").includes(file.type)) {
      openAlert({ type: "info", title: "이미지(JPG, PNG, WebP, GIF) 파일만 첨부할 수 있습니다." });
      return;
    }

    setAttachedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();

    if (!planId) {
      openAlert({ title: "리뷰를 작성할 구독 정보를 찾을 수 없습니다." });
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
        let imageUrls: string[] | undefined;
        if (attachedFile) {
          const { uploadUrl, fileUrl } = await getAttachmentPresignedUrl({
            fileName: attachedFile.name,
            fileType: attachedFile.type || "application/octet-stream",
          });
          await uploadToS3(uploadUrl, attachedFile, attachedFile.type || "application/octet-stream");
          imageUrls = [fileUrl];
        }

        await createReview({ planId, rating, content: trimmed, imageUrls });
        openAlert({
          type: "success",
          title: "리뷰가 등록되었습니다.",
          description: "소중한 리뷰를 남겨주셔서 감사합니다.",
        });
        router.push("/mypage");
        router.refresh();
      } catch (err) {
        openAlert({
          title: getErrorMessage(err, "리뷰 등록에 실패했습니다. 잠시 후 다시 시도해 주세요."),
        });
      }
    });
  };

  const isSubmittable = !!planId && rating >= 1 && content.trim().length > 0;

  if (!isLoggedIn) return null;

  return (
    <div className="bg-white">
      {/* Hero — "우리 아이의 꼬순박스, 만족하셨나요??" (텍스트 포함 배너) */}
      {/* 모바일(<910px): 전용 이미지 / 데스크톱(≥910px): 와이드 배너, 초광폭은 좌우 보완 */}
      <section aria-label="리뷰 작성 안내">
        <div className="flex h-[111px] items-center justify-center overflow-hidden md2:hidden">
          <Image
            src={reviewWriteHeroMobile}
            alt={HERO_ALT}
            className="h-[111px] w-full object-cover object-center"
            priority
          />
        </div>
        <div className="max-md2:hidden w-full bg-support-hero-side-bg">
          <div className="relative mx-auto h-[118px] w-full max-w-[1920px] overflow-hidden">
            <Image
              src={reviewWriteHeroDesktop}
              alt={HERO_ALT}
              className="absolute inset-0 h-full w-full object-cover object-center"
              priority
            />
          </div>
        </div>
      </section>

      {/* 폼 영역 */}
      <div className={`${PAGE_CONTENT_WRAPPER_CLASS} max-md:py-6 md:py-10 lg:py-10`}>
        <form onSubmit={handleSubmit}>
          <div className="rounded-[20px] bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.08)]">
            {/* 뒤로가기 — 카드 상단 */}
            <div className="flex items-center px-5 py-6 max-md:min-h-[56px] md:min-h-[94px] md:px-11 md:py-0 lg:px-11">
              <Link
                href="/mypage"
                className="inline-flex items-center gap-1 text-body-20-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 6L9 12L15 18" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>리뷰쓰기</span>
              </Link>
            </div>

            <div className="mx-auto flex w-full max-w-[718px] flex-col gap-6 px-5 pb-10 max-md:pb-8 md:px-8 md:pb-12 lg:px-8 lg:pb-12">
              {/* 상세리뷰 */}
              <div className="flex flex-col gap-2">
                <label htmlFor="review-content" className={labelClass}>
                  상세리뷰
                </label>
                <textarea
                  id="review-content"
                  placeholder="꼬순박스의 상세한 리뷰를 남겨주세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={7}
                  maxLength={MAX_CONTENT_LENGTH}
                  className={textareaClass}
                />
                <p className="self-end text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80">
                  {content.length}/{MAX_CONTENT_LENGTH}
                </p>
              </div>

              {/* 첨부파일 + 별점 */}
              <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 lg:grid-cols-2 md:gap-x-[26px] lg:gap-x-[26px]">
                <div className="flex min-w-0 flex-col gap-2">
                  <span id="review-file-label" className={labelClass}>
                    첨부파일
                  </span>
                  {attachedFile ? (
                    <div className={`${fieldClass} flex items-center gap-1`}>
                      <PaperclipIcon />
                      <span className="min-w-0 flex-1 truncate text-[var(--color-text)]">
                        {attachedFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        disabled={isPending}
                        aria-label={`${attachedFile.name} 삭제`}
                        className="ml-1 shrink-0 text-body-13-m text-[var(--color-text-secondary)] hover:text-[var(--color-text)] disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`${fieldClass} flex items-center gap-1 text-left`}
                      aria-labelledby="review-file-label"
                      disabled={isPending}
                    >
                      <PaperclipIcon />
                      <span className="truncate text-[var(--color-text-secondary)]">
                        사진을 첨부해주세요 (5MB 이하)
                      </span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_ATTACHMENT}
                    className="sr-only"
                    onChange={handleFileChange}
                    aria-label="사진 첨부"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <span className={labelClass}>별점</span>
                  <div className="flex h-10 items-center">
                    <StarRating rating={rating} onChange={setRating} disabled={isPending} />
                  </div>
                </div>
              </div>

              {/* 리뷰 공지 */}
              <div className="flex flex-col gap-2">
                <span className={labelClass}>리뷰 공지</span>
                <ul className="flex flex-col gap-1">
                  {NOTICES.map((notice) => (
                    <li
                      key={notice}
                      className="flex gap-2 text-body-13-r leading-[1.5] text-[var(--color-text-secondary)]"
                    >
                      <span aria-hidden className="select-none">·</span>
                      <span>{notice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 제출 */}
              <div className="flex justify-center pt-2 lg:pt-6">
                <button
                  type="submit"
                  disabled={!isSubmittable || isPending}
                  className={submitButtonClass}
                >
                  {isPending ? (attachedFile ? "업로드 중…" : "등록 중…") : "제출하기"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
