"use client";

import { useState } from "react";
import { Text } from "@/shared/ui";
import { DashboardCard, SectionHeader } from "../lib/dashboard-shared";
import type { InquiryDto } from "@/features/inquiry/api/types";
import { InquiryDetailModal, InquiryStatusBadge } from "@/features/inquiry/ui";

const PAGE_SIZE = 3;

/** Figma Icon/Outline/cheveron-left (20×20, stroke 1.5) */
function PaginationChevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={direction === "prev" ? "M12.5 15.8327L6.66667 9.99935L12.5 4.16602" : "M7.5 15.8327L13.3333 9.99935L7.5 4.16602"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InquiryCard({ inquiries }: { inquiries: InquiryDto[] }) {
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDto | null>(null);
  const totalPages = Math.max(1, Math.ceil(inquiries.length / PAGE_SIZE));
  const pageItems = inquiries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <DashboardCard className="lg:h-[208px]">
        <SectionHeader title="문의관리" href="/support" linkLabel="문의관리" spacing="wide" />

        <div className="flex min-h-0 flex-1 flex-col">
        {inquiries.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Text
              variant="body-13-m"
              className="leading-4 text-[var(--color-text-secondary)]"
            >
              문의 내역이 없습니다.
            </Text>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden lg:flex lg:flex-col lg:gap-[10px] lg:pr-[5px]">
            {pageItems.map((inq, index) => (
              <div
                key={inq.id}
                onClick={() => setSelectedInquiry(inq)}
                className={[
                  "flex cursor-pointer items-center gap-x-3 max-lg:py-1.5 lg:h-[22px] transition-opacity hover:opacity-70",
                  index < pageItems.length - 1 ? "max-lg:border-b max-lg:border-[var(--color-divider-warm)]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Text variant="body-13-r" className="flex-1 truncate text-[var(--color-text)] lg:font-medium lg:leading-4">
                  {inq.title}
                </Text>
                <InquiryStatusBadge inquiry={inq} />
              </div>
            ))}
          </div>
        )}

        <nav
          className="mt-auto flex shrink-0 items-center justify-center gap-2 max-lg:pt-4 lg:pt-2 text-[var(--color-text-secondary)]"
          aria-label="문의 페이지 탐색"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="이전 페이지"
            className="flex h-5 w-5 items-center justify-center rounded-[8px] transition-opacity disabled:text-[var(--color-ui-disabled)] disabled:opacity-100 hover:opacity-70"
          >
            <PaginationChevron direction="prev" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={page === n ? "page" : undefined}
              className={[
                "flex h-5 w-5 items-center justify-center leading-4 transition-colors",
                "text-body-13-r",
                page === n
                  ? "text-[var(--color-text)]"
                  : "max-lg:text-[var(--color-text-secondary)] lg:text-[var(--color-text-tertiary)]",
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
            className="flex h-5 w-5 items-center justify-center rounded-[8px] transition-opacity disabled:text-[var(--color-ui-disabled)] disabled:opacity-100 hover:opacity-70"
          >
            <PaginationChevron direction="next" />
          </button>
        </nav>
        </div>
      </DashboardCard>

      {selectedInquiry && (
        <InquiryDetailModal item={selectedInquiry} onClose={() => setSelectedInquiry(null)} />
      )}
    </>
  );
}
