"use client";

import { useEffect } from "react";
import type { InquiryDto } from "../api/types";
import { PawCircleIcon } from "@/shared/ui";

export const WAITING_MESSAGE =
  "문의해주셔서 감사합니다.\n빠르게 확인 후 1~2일 이내에\n답변드릴 예정입니다.";

const IMAGE_URL_REGEX = /\.(jpe?g|png|webp|gif)(\?|$)/i;

export function isResolved(inq: InquiryDto): boolean {
  return inq.status === "resolved" && inq.isAnswered && Boolean(inq.answer?.trim());
}

function getImageAttachments(inq: InquiryDto): string[] {
  return inq.attachmentUrls?.filter((url) => IMAGE_URL_REGEX.test(url)) ?? [];
}

function AttachmentThumbnails({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex flex-row items-center gap-3">
      {urls.map((url, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${url}-${idx}`}
          src={url}
          alt={`첨부 이미지 ${idx + 1}`}
          className="h-20 w-20 shrink-0 rounded-[6px] border border-[var(--color-text-muted)] object-cover"
          loading="lazy"
        />
      ))}
    </div>
  );
}

export function InquiryStatusBadge({ inquiry }: { inquiry: InquiryDto }) {
  const done = isResolved(inquiry);
  return (
    <span
      className={
        done
          ? "inline-flex items-center justify-center rounded-full bg-[var(--color-status-success-bg)] px-3 py-1 text-caption-12-m leading-[14px] text-[var(--color-status-success)]"
          : "inline-flex items-center justify-center rounded-full bg-[var(--color-status-waiting-bg)] px-3 py-1 text-caption-12-m leading-[14px] text-[var(--color-status-waiting)]"
      }
      style={{ opacity: 0.8 }}
    >
      {done ? "완료" : "대기"}
    </span>
  );
}

export function InquiryDetailModal({ item, onClose }: { item: InquiryDto; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-[480px] flex-col gap-4 overflow-y-auto rounded-[20px] bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <PawCircleIcon />
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5"
                stroke="var(--color-text-secondary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-body-14-sb text-[var(--color-text)]">{item.title}</p>
          <InquiryStatusBadge inquiry={item} />
        </div>
        <AttachmentThumbnails urls={getImageAttachments(item)} />
        <div className="min-h-[160px]">
          {isResolved(item) ? (
            <p className="whitespace-pre-wrap text-body-14-m leading-[160%] text-[var(--color-text)]">
              {item.answer!.trim()}
            </p>
          ) : (
            <p className="whitespace-pre-wrap text-center text-body-14-m leading-[160%] text-[var(--color-text-secondary)]">
              {WAITING_MESSAGE}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
