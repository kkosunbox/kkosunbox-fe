"use client";

import { useEffect, useState } from "react";
import { Text } from "@/shared/ui";
import { DashboardCard, SectionHeader } from "./dashboard-shared";
import { ChevronLeftIcon, ChevronRightIcon } from "./mypage-icons";
import type { InquiryDto } from "@/features/inquiry/api/types";
import PawCircleIcon from "../../support/shared/ui/PawCircleIcon";
// import { formatInquiryDate } from "@/features/inquiry/lib";

const PAGE_SIZE = 3;

const WAITING_MESSAGE =
  "문의해주셔서 감사합니다.\n빠르게 확인 후 1~2일 이내에\n답변드릴 예정입니다.";

const IMAGE_URL_REGEX = /\.(jpe?g|png|webp|gif)(\?|$)/i;

function isResolved(inq: InquiryDto): boolean {
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

function InquiryDetailModal({ item, onClose }: { item: InquiryDto; onClose: () => void }) {
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
      <div className="relative z-10 flex w-full max-w-[480px] flex-col gap-4 rounded-[20px] bg-white p-6 shadow-lg">
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
  );
}

function InquiryStatusBadge({ inquiry }: { inquiry: InquiryDto }) {
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

export function InquiryCard({ inquiries }: { inquiries: InquiryDto[] }) {
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDto | null>(null);
  const totalPages = Math.max(1, Math.ceil(inquiries.length / PAGE_SIZE));
  const pageItems = inquiries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
    <DashboardCard>
      <SectionHeader title="문의관리" href="/support" linkLabel="문의관리" spacing="tight" />

      {inquiries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6">
          <Text variant="body-13-r" className="text-[var(--color-text-secondary)]">
            문의 내역이 없습니다.
          </Text>
        </div>
      ) : (
        <div className="flex-1">
          {pageItems.map((inq, index) => (
            <div
              key={inq.id}
              onClick={() => setSelectedInquiry(inq)}
              className={[
                "flex cursor-pointer items-center gap-x-3 py-1.5 transition-opacity hover:opacity-70",
                index < pageItems.length - 1 ? "border-b border-[var(--color-divider-warm)]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Text variant="body-13-r" className="flex-1 truncate text-[var(--color-text)]">
                {inq.title}
              </Text>
              <InquiryStatusBadge inquiry={inq} />
            </div>
          ))}
        </div>
      )}

      <nav
        className="mt-auto flex items-center justify-center gap-1 pt-4 text-[var(--color-text-secondary)]"
        aria-label="문의 페이지 탐색"
      >
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="이전 페이지"
          className="flex h-5 w-5 items-center justify-center rounded-full transition-opacity disabled:opacity-30 hover:opacity-70"
        >
          <ChevronLeftIcon />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPage(n)}
            aria-current={page === n ? "page" : undefined}
            className={[
              "min-w-[16px] max-md:text-caption-11-r md:text-caption-12-r leading-none transition-colors",
              page === n
                ? "font-semibold text-[var(--color-text)]"
                : "text-[var(--color-text-secondary)]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="다음 페이지"
          className="flex h-5 w-5 items-center justify-center rounded-full transition-opacity disabled:opacity-30 hover:opacity-70"
        >
          <ChevronRightIcon />
        </button>
      </nav>
    </DashboardCard>

      {selectedInquiry && (
        <InquiryDetailModal item={selectedInquiry} onClose={() => setSelectedInquiry(null)} />
      )}
    </>
  );
}
