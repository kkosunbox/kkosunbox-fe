"use client";

import { useState } from "react";
import { Text } from "@/shared/ui";
import { DashboardCard, SectionHeader } from "./dashboard-shared";
import { ChevronLeftIcon, ChevronRightIcon } from "./mypage-icons";
import { INQUIRIES, INQUIRY_TOTAL_PAGES } from "./mypage-mock";

export function InquiryCard() {
  const [page, setPage] = useState(1);

  return (
    <DashboardCard>
      <SectionHeader title="문의관리" href="/support" linkLabel="문의관리" />

      <div>
        {INQUIRIES.map((inq, index) => (
          <div
            key={inq.id}
            className={[
              "grid grid-cols-[minmax(0,1fr)_56px_52px] items-center gap-x-3 py-1.5 md:grid-cols-[minmax(0,1fr)_62px_58px]",
              index < INQUIRIES.length - 1 ? "border-b border-[var(--color-divider-warm)]" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Text variant="body-13-r" className="truncate text-[var(--color-text)]">
              {inq.text}
            </Text>
            <Text variant="caption-12-r" className="text-right text-[var(--color-text-secondary)]">
              {inq.date}
            </Text>
            <Text
              variant="caption-12-r"
              className={[
                "text-right",
                inq.status === "처리중"
                  ? "text-[var(--color-accent-orange)]"
                  : "text-[var(--color-text-secondary)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {inq.status}
            </Text>
          </div>
        ))}
      </div>

      <nav
        className="mt-4 flex items-center justify-center gap-1 text-[var(--color-text-secondary)]"
        aria-label="문의 페이지 탐색"
      >
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          aria-label="이전 페이지"
          className="flex h-5 w-5 items-center justify-center rounded-full transition-opacity disabled:opacity-30 hover:opacity-70"
        >
          <ChevronLeftIcon />
        </button>
        {Array.from({ length: INQUIRY_TOTAL_PAGES }, (_, i) => i + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setPage(pageNumber)}
            aria-current={page === pageNumber ? "page" : undefined}
            className={[
              "min-w-[16px] max-md:text-caption-11-r md:text-caption-12-r leading-none transition-colors",
              page === pageNumber
                ? "font-semibold text-[var(--color-text)]"
                : "text-[var(--color-text-secondary)]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(INQUIRY_TOTAL_PAGES, prev + 1))}
          disabled={page === INQUIRY_TOTAL_PAGES}
          aria-label="다음 페이지"
          className="flex h-5 w-5 items-center justify-center rounded-full transition-opacity disabled:opacity-30 hover:opacity-70"
        >
          <ChevronRightIcon />
        </button>
      </nav>
    </DashboardCard>
  );
}
