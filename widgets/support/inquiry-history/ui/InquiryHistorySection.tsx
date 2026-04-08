"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { InquiryDto, InquiryStatus } from "@/features/inquiry/api";
import { getInquiries } from "@/features/inquiry/api";
import { ApiError } from "@/shared/lib/api/types";
import FaqQuestion from "../../faq/assets/faq-question.png";
import PawCircleIcon from "../../shared/ui/PawCircleIcon";

const ITEMS_PER_PAGE = 4;

const STATUS_LABEL: Record<InquiryStatus, string> = {
  pending: "접수",
  in_progress: "처리 중",
  resolved: "완료",
};

function formatInquiryBody(row: InquiryDto): string {
  const lines: string[] = [row.content];
  if (row.isAnswered && row.answer?.trim()) {
    lines.push("", "답변:", row.answer.trim());
  }
  return lines.join("\n");
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function InquiryHistorySection() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<InquiryDto[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error" | "unauthorized">("loading");
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInquiries()
      .then((res) => {
        if (cancelled) return;
        const sorted = [...res.inquiries].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRows(sorted);
        setPage(1);
        setLoadState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isUnauthorized) {
          setLoadState("unauthorized");
          setLoadMessage(null);
          return;
        }
        setLoadState("error");
        setLoadMessage(
          err instanceof ApiError ? err.message : "문의 내역을 불러오지 못했습니다.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const currentItems = useMemo(
    () => rows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [rows, currentPage],
  );

  return (
    <div className="min-h-screen bg-white py-10 max-md:py-8 md:py-[50px]">
      <div className="mx-auto flex w-full max-w-[1013px] flex-col gap-6 px-4 max-md:px-4 md:px-8">
        {/* <header className="max-md:hidden flex flex-col items-center gap-3 text-center">
          <Image
            src={FaqTitle}
            width={172}
            height={25}
            alt="꼬순박스 고객센터"
            className="h-[25px] w-auto"
            priority
          />
          <p
            className="max-w-[415px] text-body-16-r leading-[150%] tracking-[-0.02em] text-[var(--color-text)]"
            style={{
              fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
            }}
          >
            궁금하거나 요청하실 사항이 있으시면 상세히 안내해 드리겠습니다.
          </p>
        </header> */}

        <section
          className="mt-4 flex min-h-[118px] flex-col items-stretch justify-center gap-4 rounded-[20px] px-6 py-6 max-md:py-6 md:flex-row md:items-center md:justify-between md:gap-6 md:px-11 md:py-0"
          style={{ background: "var(--gradient-support-banner)" }}
          aria-label="1:1 문의 안내"
        >
          <div className="flex w-full flex-col gap-4 max-md:items-center max-md:text-center md:max-w-[330px] md:items-start md:text-left">
            <Image
              src={FaqQuestion}
              alt="꼬순박스에 궁금한 점이 있으신가요?"
              width={FaqQuestion.width}
              height={FaqQuestion.height}
              sizes="(max-width: 767px) 100vw, 280px"
              className="h-auto max-md:w-full md:w-[280px]"
            />
            <p className="text-body-14-m capitalize leading-[17px] tracking-[-0.04em] text-[var(--color-text)] max-md:text-center md:text-left">
              1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다.
            </p>
          </div>
          <Link
            href="/inquiry"
            className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-[30px] bg-[var(--color-accent)] px-6 py-[13px] text-center text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white max-md:max-w-none md:w-[200px]"
          >
            문의하기
          </Link>
        </section>

        <section
          className="rounded-[20px] bg-[var(--color-support-faq-surface)] px-5 py-8 max-md:px-4 max-md:py-6 md:px-[45px] md:pb-7 md:pt-8"
          aria-label="내 문의내역"
        >
          <div className="mb-6 max-md:mb-6 md:mb-8">
            <Link
              href="/support"
              className="inline-flex items-center gap-1 text-body-20-sb text-[var(--color-text)]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 6L9 12L15 18" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>내 문의내역</span>
            </Link>
          </div>

          {loadState === "loading" && (
            <p className="py-16 text-center text-body-16-r text-[var(--color-text-secondary)]">
              문의 내역을 불러오는 중…
            </p>
          )}

          {loadState === "unauthorized" && (
            <div className="flex flex-col items-center py-16">
              <p className="text-center text-body-16-r text-[var(--color-text-secondary)]">
                로그인 후 이용할 수 있습니다.
              </p>
              <Link
                href="/login?next=/support/history"
                className="mt-4 text-body-14-m text-[var(--color-accent)] underline underline-offset-2"
              >
                로그인하기
              </Link>
            </div>
          )}

          {loadState === "error" && (
            <div className="flex flex-col items-center py-16">
              <p className="text-center text-body-16-r text-[var(--color-text-secondary)]">
                {loadMessage ?? "문의 내역을 불러오지 못했습니다."}
              </p>
            </div>
          )}

          {loadState === "ok" && currentItems.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {currentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[20px] bg-white p-4 md:p-4"
                >
                  <PawCircleIcon />
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body-14-sb text-[var(--color-text)]">{item.title}</p>
                      <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-body-12-m text-[var(--color-accent)]">
                        {STATUS_LABEL[item.status]}
                      </span>
                    </div>
                    <p className="text-body-12-r text-[var(--color-text-secondary)]">
                      {new Date(item.createdAt).toLocaleString("ko-KR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="whitespace-pre-wrap text-body-14-m leading-5 text-[var(--color-text)]">
                      {formatInquiryBody(item)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {loadState === "ok" && rows.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <p className="text-body-16-r text-[var(--color-text-secondary)]">문의 내역이 없습니다.</p>
              <Link
                href="/inquiry"
                className="mt-4 text-body-14-m text-[var(--color-accent)] underline underline-offset-2"
              >
                문의하기
              </Link>
            </div>
          ) : null}

          {loadState === "ok" && totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="문의 내역 페이지 탐색">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
                className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--color-ui-disabled)] disabled:opacity-40"
              >
                <ChevronLeftIcon />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const active = currentPage === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-label={`${p}페이지`}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "flex h-6 min-w-[24px] items-center justify-center bg-transparent text-body-13-sb leading-4 text-[var(--color-text)]"
                        : "flex h-6 min-w-[24px] items-center justify-center bg-transparent text-body-13-r leading-4 text-[var(--color-text)]"
                    }
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
                className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--color-ui-disabled)] disabled:opacity-40"
              >
                <ChevronRightIcon />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
