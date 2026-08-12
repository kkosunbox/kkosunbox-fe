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

  const content = item.content?.trim();
  const attachments = getImageAttachments(item);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      {/*
        헤더는 고정, 본문만 스크롤한다. 문의 내용·답변은 길이 상한이 없어(등록 시 200자,
        관리자 답변은 제한 없음) 모달 전체를 늘리면 뷰포트를 넘어가고 닫기 버튼까지
        화면 밖으로 밀린다.
      */}
      <div className="relative z-10 flex max-h-[70vh] w-full max-w-[480px] flex-col rounded-[20px] bg-white shadow-lg">
        <div className="flex shrink-0 items-start justify-between px-6 pt-6 pb-4">
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-14-sb break-words text-[var(--color-text)]">{item.title}</p>
            <InquiryStatusBadge inquiry={item} />
          </div>

          {content ? (
            <section className="flex flex-col gap-2">
              <p className="text-caption-12-m leading-[14px] text-[var(--color-text-secondary)]">
                문의 내용
              </p>
              <p className="whitespace-pre-wrap break-words rounded-[12px] bg-[var(--color-surface-warm)] px-4 py-3 text-body-14-m leading-[160%] text-[var(--color-text)]">
                {content}
              </p>
            </section>
          ) : null}

          <AttachmentThumbnails urls={attachments} />

          <div className="h-px w-full shrink-0 bg-[var(--color-divider-warm)]" />

          <section className="flex flex-col gap-2">
            <p className="text-caption-12-m leading-[14px] text-[var(--color-text-secondary)]">
              답변
            </p>
            <div className="flex min-h-[120px] flex-col justify-center">
              {isResolved(item) ? (
                <p className="whitespace-pre-wrap break-words text-body-14-m leading-[160%] text-[var(--color-text)]">
                  {item.answer!.trim()}
                </p>
              ) : (
                <p className="whitespace-pre-wrap text-center text-body-14-m leading-[160%] text-[var(--color-text-secondary)]">
                  {WAITING_MESSAGE}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
