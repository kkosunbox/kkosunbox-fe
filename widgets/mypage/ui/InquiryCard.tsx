"use client";

import { useState } from "react";
import { Text } from "@/shared/ui";
import { DashboardCard, SectionHeader } from "./dashboard-shared";
import { ChevronLeftIcon, ChevronRightIcon } from "./mypage-icons";
import type { InquiryDto } from "@/features/inquiry/api/types";
import { InquiryDetailModal, InquiryStatusBadge } from "@/features/inquiry/ui";

const PAGE_SIZE = 3;

export function InquiryCard({ inquiries }: { inquiries: InquiryDto[] }) {
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDto | null>(null);
  const totalPages = Math.max(1, Math.ceil(inquiries.length / PAGE_SIZE));
  const pageItems = inquiries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <DashboardCard className="lg:h-[208px]">
        <SectionHeader title="문의관리" href="/support" linkLabel="문의관리" spacing="tight" />

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
          <div className="min-h-0 flex-1 overflow-hidden">
            {pageItems.map((inq, index) => (
              <div
                key={inq.id}
                onClick={() => setSelectedInquiry(inq)}
                className={[
                  "flex cursor-pointer items-center gap-x-3 max-lg:py-1.5 lg:py-1 transition-opacity hover:opacity-70",
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
          className="mt-auto flex shrink-0 items-center justify-center max-lg:gap-2 max-lg:pt-4 lg:gap-1 lg:pt-2 text-[var(--color-text-secondary)]"
          aria-label="문의 페이지 탐색"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="이전 페이지"
            className="flex h-5 w-5 items-center justify-center rounded-[8px] transition-opacity disabled:text-[var(--color-ui-disabled)] disabled:opacity-100 hover:opacity-70"
          >
            <ChevronLeftIcon className="max-lg:h-5 max-lg:w-5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={page === n ? "page" : undefined}
              className={[
                "flex h-5 w-5 items-center justify-center leading-4 transition-colors",
                "max-lg:text-body-13-r lg:min-w-[16px] lg:text-caption-12-r lg:leading-none",
                page === n
                  ? "text-[var(--color-text)] max-lg:font-normal lg:font-semibold"
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
            className="flex h-5 w-5 items-center justify-center rounded-[8px] transition-opacity disabled:text-[var(--color-ui-disabled)] disabled:opacity-100 hover:opacity-70"
          >
            <ChevronRightIcon className="max-lg:h-5 max-lg:w-5" />
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
