"use client";

import { useState } from "react";
import { Text } from "@/shared/ui";
import { DashboardCard, SectionHeader } from "./dashboard-shared";
import { ChevronLeftIcon, ChevronRightIcon } from "./mypage-icons";
import type { InquiryDto, InquiryStatus } from "@/features/inquiry/api/types";

const PAGE_SIZE = 3;

function statusLabel(status: InquiryStatus): string {
  return status === "resolved" ? "답변완료" : "처리중";
}

function fmtDateTime(dateStr: string): string {
  return dateStr.slice(0, 10).replace(/-/g, ".");
}

export function InquiryCard({ inquiries }: { inquiries: InquiryDto[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(inquiries.length / PAGE_SIZE));
  const pageItems = inquiries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardCard>
      <SectionHeader title="문의관리" href="/support" linkLabel="문의관리" />

      {inquiries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6">
          <Text variant="body-13-r" className="text-[var(--color-text-muted)]">
            문의 내역이 없습니다.
          </Text>
        </div>
      ) : (
        <div className="flex-1">
          {pageItems.map((inq, index) => (
            <div
              key={inq.id}
              className={[
                "grid grid-cols-[minmax(0,1fr)_56px_52px] items-center gap-x-3 py-1.5 md:grid-cols-[minmax(0,1fr)_62px_58px]",
                index < pageItems.length - 1 ? "border-b border-[var(--color-divider-warm)]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Text variant="body-13-r" className="truncate text-[var(--color-text)]">
                {inq.title}
              </Text>
              <Text variant="caption-12-r" className="text-right text-[var(--color-text-secondary)]">
                {fmtDateTime(inq.createdAt)}
              </Text>
              <Text
                variant="caption-12-r"
                className={[
                  "text-right",
                  inq.status !== "resolved"
                    ? "text-[var(--color-accent-orange)]"
                    : "text-[var(--color-text-secondary)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {statusLabel(inq.status)}
              </Text>
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
  );
}
