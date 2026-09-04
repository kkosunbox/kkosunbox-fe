"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PAGE_CONTENT_WRAPPER_FLEX_CLASS } from "@/shared/config/layout";
import { ScrollReveal, PawCircleIcon } from "@/shared/ui";
import { SupportHero } from "@/widgets/support/shared";
import PartnershipHandshake from "../assets/partnership-handshake.webp";
import { FAQ_ITEMS, type FaqItem } from "../model/faqItems";

const ITEMS_PER_PAGE = 6;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 검색어와 부분 일치 구간을 primary 색으로 강조 (필터와 동일하게 대소문자 무시). */
function highlightMatch(text: string, rawQuery: string): ReactNode {
  const q = rawQuery.trim();
  if (!q) return text;
  try {
    const re = new RegExp(escapeRegExp(q), "gi");
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    let key = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > lastIndex) {
        nodes.push(text.slice(lastIndex, m.index));
      }
      nodes.push(
        <span key={`faq-hl-${key++}`} className="text-primary">
          {m[0]}
        </span>,
      );
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }
    return nodes.length > 0 ? nodes : text;
  } catch {
    return text;
  }
}

/* ── 아이콘 ──────────────────────────────────────────────── */
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

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" stroke="var(--color-text-secondary)" strokeWidth="1.23" />
      <path
        d="M10.5 10.5L13.5 13.5"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.23"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── FAQ 상세 모달 ──────────────────────────────────────── */
function FaqDetailModal({ item, onClose }: { item: FaqItem; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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
            className="flex h-6 w-6 items-center justify-center hover:opacity-70 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="text-body-14-sb text-[var(--color-text)]">{item.question}</p>
        <p className="min-h-[160px] text-body-14-m leading-[160%] text-[var(--color-text)]">{item.fullAnswer}</p>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────────── */
export default function SupportSection({
  showBanner = true,
  /** /support 페이지: main flex 영역을 채우고 푸터를 뷰포트 하단에 맞춤 */
  fillViewport = false,
}: {
  showBanner?: boolean;
  fillViewport?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className={fillViewport ? "flex min-h-full flex-1 flex-col" : "bg-white"}>
      {showBanner && <SupportHero />}
      <div
        className={`${fillViewport ? "max-md:pt-8 max-md:pb-6" : "max-md:py-6"} md:pb-10${
          fillViewport ? " flex flex-1 flex-col" : ""
        }`}
      >
      <div className={PAGE_CONTENT_WRAPPER_FLEX_CLASS}>
        {/* ── 파트너 제안 CTA ── */}
        {showBanner && (
          <ScrollReveal variant="fade-in" delay={150}>
            <section
              id="partnership"
              className="flex w-full items-center rounded-[12px] max-md:min-h-[196px] max-md:flex-col max-md:justify-center max-md:gap-3 max-md:px-5 max-md:py-4 md:h-[88px] md:flex-row md:px-8 lg:px-10"
              style={{ background: "var(--gradient-support-banner)" }}
              aria-labelledby="partnership-banner-title"
            >
              <Image
                src={PartnershipHandshake}
                alt=""
                aria-hidden="true"
                className="h-auto shrink-0 max-md:w-[72px] md:w-[92px]"
                sizes="(max-width: 767px) 72px, 92px"
              />

              <div className="min-w-0 max-md:text-center md:ml-6">
                <h2
                  id="partnership-banner-title"
                  className="text-body-16-b tracking-[-0.04em] text-[var(--color-text)]"
                >
                  꼬순박스와 함께할 파트너를 기다립니다.🌟
                </h2>
                <p className="mt-1 text-body-12-r text-[var(--color-support-banner-heading)]">
                  꼬순박스와 함께하고 싶으신가요? 언제든 문의해주세요.
                </p>
              </div>

              <Link
                href="/partnership"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-white text-body-14-sb text-[var(--color-cta-button)] transition-opacity hover:opacity-85 max-md:h-10 max-md:w-full md:ml-auto md:h-10 md:w-[142px]"
              >
                제휴·입점 문의&nbsp;→
              </Link>
            </section>
          </ScrollReveal>
        )}

        {/* ── 모바일·태블릿 (< 1200px): 문의하기 CTA (히어로 아래) ── */}
        {showBanner && (
          <ScrollReveal variant="fade-in" delay={200} className="flex flex-col items-center lg:hidden">
            <Link
              href="/inquiry"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[var(--color-cta-button)] text-body-16-sb leading-[1.5] tracking-[-0.02em] text-white"
            >
              문의하기
            </Link>
          </ScrollReveal>
        )}

        {/* ── FAQ 패널 (#FFF7EF) ── */}
        <ScrollReveal variant="fade-up" delay={150}>
          <section
            className={`relative rounded-[20px] bg-[var(--color-support-faq-surface)] py-8 max-md:px-5 max-md:py-5 md:px-[45px] lg:px-[45px] md:pb-7 lg:pb-7 md:pt-6 lg:pt-6${fillViewport ? " flex min-h-0 flex-1 flex-col" : ""}`}
            aria-label="자주 묻는 질문"
          >
          {/* 태블릿·데스크탑 우상단(≥768): 내 문의내역 링크. 문의하기 버튼은 데스크탑(≥1200) 전용,
              단 배너(풀폭 CTA) 미노출 시에는 태블릿에서도 폴백으로 노출 */}
          <div className="absolute top-6 right-[45px] z-10 max-md:hidden flex items-center gap-3">
            <Link
              href="/support/history"
              className="text-body-14-m leading-[17px] tracking-[-0.04em] text-[var(--color-text-label)] underline underline-offset-2"
            >
              내 문의내역
            </Link>
            <Link
              href="/inquiry"
              className={`${showBanner ? "max-lg:hidden" : "max-md:hidden"} inline-flex h-10 w-[148px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-cta-button)] px-6 text-center text-body-14-sb leading-[1.5] tracking-[-0.02em] text-white`}
            >
              문의하기
            </Link>
          </div>
          {/* 모바일 전용(<768): FAQ 제목 + 내 문의내역 링크 */}
          <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
            <h2 className="whitespace-nowrap text-body-13-sb tracking-[-0.04em] text-[var(--color-text)]">
              자주 묻는 질문(FAQ)
            </h2>
            <Link
              href="/support/history"
              className="shrink-0 text-body-11-sb tracking-[-0.04em] text-[var(--color-text-label)] underline underline-offset-2"
            >
              내 문의내역
            </Link>
          </div>

          {/* 검색 */}
          <div className="mb-6 md:mb-8 lg:mb-8">
            <label className="flex h-10 max-md:w-full cursor-text items-center gap-2 rounded-[8px] bg-white px-5 py-2 shadow-[0px_0.73544px_1.47088px_rgba(16,24,40,0.05)] md:w-[320px] lg:w-[320px] md:shrink-0 lg:shrink-0">
              <span className="sr-only">질문 검색</span>
              <SearchIcon />
              <input
                type="search"
                placeholder="질문을 검색하세요"
                value={query}
                onChange={handleQueryChange}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-body-14-m leading-[17px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
              />
            </label>
          </div>

          {currentItems.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
              {currentItems.map((item) => (
                <li
                  key={item.question}
                  onClick={() => setSelectedFaq(item)}
                  className="flex cursor-pointer flex-col gap-3 rounded-[20px] bg-white p-4 transition-shadow hover:shadow-md md:min-h-[208px] lg:min-h-[208px] md:p-4 lg:p-4"
                >
                  <PawCircleIcon />
                  <div className="flex flex-col gap-2">
                    <p className="text-body-14-sb text-[var(--color-text)]">
                      {highlightMatch(item.question, query)}
                    </p>
                    <p className="text-body-14-m leading-5 text-[var(--color-text)]">
                      {highlightMatch(item.answer, query)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-16">
              <p className="text-body-16-r text-[var(--color-text-secondary)]">검색 결과가 없습니다.</p>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="FAQ 페이지 탐색">
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
        </ScrollReveal>
      </div>
      </div>

      {selectedFaq && (
        <FaqDetailModal item={selectedFaq} onClose={() => setSelectedFaq(null)} />
      )}
    </div>
  );
}
