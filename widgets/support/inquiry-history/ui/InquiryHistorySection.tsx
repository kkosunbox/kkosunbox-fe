"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { InquiryDto } from "@/features/inquiry/api";
import { getInquiries } from "@/features/inquiry/api";
import { formatInquiryDate } from "@/features/inquiry/lib";
import { isResolved, WAITING_MESSAGE } from "@/features/inquiry/ui";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { ApiError } from "@/shared/lib/api/types";
import { useAuth } from "@/features/auth";
import { SupportHero } from "@/widgets/support/shared";
import InquiryQuestion from "../assets/inquiry-question.webp";
import InquiryEmpty from "../assets/inquiry-empty.svg";
import styles from "./InquiryHistorySection.module.css";

const PAGE_SIZE = 5;

const FILTERS = [
  { label: "전체", matches: () => true },
  { label: "답변완료", matches: (item: InquiryDto) => isResolved(item) },
  { label: "답변대기중", matches: (item: InquiryDto) => !isResolved(item) },
] as const;

const IMAGE_URL_REGEX = /\.(jpe?g|png|webp|gif)(\?|$)/i;

function getImageAttachments(row: InquiryDto): string[] {
  return row.attachmentUrls?.filter((url) => IMAGE_URL_REGEX.test(url)) ?? [];
}

function Chevron({ direction = "down", className }: { direction?: "down" | "left" | "right"; className?: string }) {
  const path =
    direction === "left"
      ? "m12 5-5 5 5 5"
      : direction === "right"
        ? "m8 5 5 5-5 5"
        : "m5 8 5 5 5-5";

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <path d={path} />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="m13 13 4 4" />
    </svg>
  );
}

export default function InquiryHistorySection() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<InquiryDto[]>([]);
  const [filter, setFilter] = useState<string>("전체");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [fetchState, setFetchState] = useState<"loading" | "ok" | "error" | "unauthorized">("loading");
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const { isLoggedIn, isAuthLoading } = useAuth();

  /**
   * accessToken은 메모리에만 있어 새로고침하면 비어 있고, AuthProvider가 refreshToken·쿠키로
   * 다시 채운다. 자식 effect가 부모(AuthProvider) effect보다 먼저 실행되므로 그냥 마운트 시점에
   * 요청하면 Authorization 헤더 없이 나가 401이 뜬다(화면 로그인 상태는 SSR 쿠키 기준이라 유지됨).
   * 부트스트랩이 끝날 때까지 기다렸다가 요청한다.
   */
  const loadState = isAuthLoading ? "loading" : !isLoggedIn ? "unauthorized" : fetchState;

  useEffect(() => {
    if (isAuthLoading || !isLoggedIn) return;

    let cancelled = false;
    getInquiries()
      .then((res) => {
        if (cancelled) return;
        const sorted = [...res.inquiries].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRows(sorted);
        setPage(1);
        setFetchState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isUnauthorized) {
          setFetchState("unauthorized");
          setLoadMessage(null);
          return;
        }
        setFetchState("error");
        setLoadMessage(getErrorMessage(err, "문의 내역을 불러오지 못했습니다."));
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isLoggedIn]);

  const filteredRows = useMemo(() => {
    const selectedFilter = FILTERS.find((item) => item.label === filter) ?? FILTERS[0];
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((item) => selectedFilter.matches(item))
      .filter(
        (item) =>
          !normalizedQuery ||
          `${item.title} ${item.content ?? ""} ${item.answer ?? ""}`
            .toLowerCase()
            .includes(normalizedQuery),
      );
  }, [rows, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const currentItems = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetResults = () => {
    setPage(1);
    setOpenId(null);
  };

  const goToPage = (next: number) => {
    setPage(next);
    setOpenId(null);
  };

  return (
    <div className={styles.page}>
      <SupportHero />

      <div className={styles.container}>
        <h1>
          <Link href="/support" className={styles.title}>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M20 8L12 16L20 24" />
            </svg>
            내 문의내역
          </Link>
        </h1>

        <section className={styles.banner} aria-labelledby="inquiry-banner-title">
          <Image src={InquiryQuestion} alt="" aria-hidden="true" width={92} height={52} />
          <div>
            <h2 id="inquiry-banner-title">꼬순박스에 궁금하신 점이 있으신가요?</h2>
            <p>궁금하신 내용을 남겨주시면 확인 후 빠르게 답변드리겠습니다.</p>
          </div>
          <Link href="/inquiry">1:1 문의하기</Link>
        </section>

        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="문의 답변 상태">
            {FILTERS.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={filter === item.label}
                onClick={() => {
                  setFilter(item.label);
                  resetResults();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className={styles.search}>
            <SearchIcon />
            <span className="sr-only">질문 검색</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetResults();
              }}
              placeholder="질문을 검색하세요"
            />
          </label>
        </div>

        {loadState === "loading" && <p className={styles.status}>문의 내역을 불러오는 중…</p>}

        {loadState === "unauthorized" && (
          <div className={styles.status}>
            <p>로그인 후 이용할 수 있습니다.</p>
            <Link href="/login?next=/support/history">로그인하기</Link>
          </div>
        )}

        {loadState === "error" && (
          <p className={styles.status}>{loadMessage ?? "문의 내역을 불러오지 못했습니다."}</p>
        )}

        {loadState === "ok" && rows.length === 0 && (
          <div className={styles.empty}>
            <Image src={InquiryEmpty} alt="" aria-hidden="true" width={88} height={88} />
            <h2>문의하신 내역이 없습니다.</h2>
            <p>꼬순박스 관련 궁금하신 내용을 문의해주세요.</p>
            <Link href="/inquiry">1:1 문의하기</Link>
          </div>
        )}

        {loadState === "ok" && rows.length > 0 && (
          <section aria-label="내 문의내역">
            {currentItems.length > 0 ? (
              <ul className={styles.list}>
                {currentItems.map((item) => {
                  const isOpen = openId === item.id;
                  const resolved = isResolved(item);
                  const content = item.content?.trim();
                  const attachments = getImageAttachments(item);
                  const bodyId = `inquiry-body-${item.id}`;

                  return (
                    <li key={item.id} className={styles.item} data-open={isOpen}>
                      <h3>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={bodyId}
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                        >
                          <span className={styles.question}>
                            <em>Q.</em>
                            <span>{item.title}</span>
                          </span>
                          <span className={styles.meta}>
                            <time dateTime={item.createdAt}>{formatInquiryDate(item.createdAt)}</time>
                            <span className={styles.badge} data-done={resolved}>
                              {resolved ? "답변완료" : "답변대기중"}
                            </span>
                          </span>
                          <Chevron className={styles.chevron} />
                        </button>
                      </h3>
                      {isOpen && (
                        <div id={bodyId} className={styles.body}>
                          {content && <p>{content}</p>}
                          {attachments.length > 0 && (
                            <div className={styles.attachments}>
                              {attachments.map((url, idx) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={`${url}-${idx}`}
                                  src={url}
                                  alt={`첨부 이미지 ${idx + 1}`}
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          )}
                          <p className={styles.answer} data-waiting={!resolved}>
                            {resolved ? item.answer!.trim() : WAITING_MESSAGE.replace(/\n/g, " ")}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.status}>검색 결과가 없습니다.</p>
            )}

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="문의 내역 페이지 탐색">
                <button
                  type="button"
                  aria-label="이전 페이지"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                >
                  <Chevron direction="left" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    aria-label={`${number}페이지`}
                    aria-current={currentPage === number ? "page" : undefined}
                    onClick={() => goToPage(number)}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="다음 페이지"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                >
                  <Chevron direction="right" />
                </button>
              </nav>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
