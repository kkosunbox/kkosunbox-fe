"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import logo from "@/shared/assets/logo-main.svg";
import { openKakaoChannelChat } from "@/shared/ui";
import { SupportHero } from "@/widgets/support/shared";
import PartnershipHandshake from "../assets/partnership-handshake.webp";
import { FAQ_ITEMS } from "../model/faqItems";
import styles from "./SupportSection.module.css";

const PAGE_SIZE = 5;

const FILTERS = [
  { label: "전체", matches: () => true },
  { label: "배송문의", matches: (category: string) => category === "배송" },
  {
    label: "주문문의",
    matches: (category: string) =>
      ["주문 및 결제", "쿠폰", "교환 · 반품 · 환불"].includes(category),
  },
  { label: "구독문의", matches: (category: string) => category === "정기구독" },
] as const;

function Chevron({ direction = "down" }: { direction?: "down" | "left" | "right" }) {
  const path =
    direction === "left"
      ? "m12 5-5 5 5 5"
      : direction === "right"
        ? "m8 5 5 5-5 5"
        : "m5 8 5 5 5-5";

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
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

export default function SupportSection({
  showBanner = true,
  fillViewport = false,
}: {
  showBanner?: boolean;
  fillViewport?: boolean;
}) {
  const [filter, setFilter] = useState("전체");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openQuestion, setOpenQuestion] = useState<string | null>(
    FAQ_ITEMS[0]?.question ?? null,
  );

  const filteredItems = useMemo(() => {
    const selectedFilter = FILTERS.find((item) => item.label === filter) ?? FILTERS[0];
    const normalizedQuery = query.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => selectedFilter.matches(item.category)).filter(
      (item) =>
        !normalizedQuery ||
        `${item.question} ${item.fullAnswer}`.toLowerCase().includes(normalizedQuery),
    );
  }, [filter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const resetResults = () => {
    setPage(1);
    setOpenQuestion(null);
  };

  return (
    <div className={styles.page} data-fill-viewport={fillViewport}>
      {showBanner && <SupportHero />}

      <div className={styles.container} data-embedded={!showBanner}>
        {showBanner && <h1>고객센터</h1>}

        {showBanner && (
          <section
            id="partnership"
            className={styles.partnership}
            aria-labelledby="partnership-title"
          >
            <Image src={PartnershipHandshake} alt="" aria-hidden="true" width={92} height={52} />
            <div>
              <h2 id="partnership-title">꼬순박스와 함께할 파트너를 기다립니다.🌟</h2>
              <p>꼬순박스와 함께하고 싶으신가요? 언제든 문의해주세요.</p>
            </div>
            <Link href="/partnership">
              제휴·입점 문의 <span aria-hidden="true">→</span>
            </Link>
          </section>
        )}

        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="FAQ 분류">
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

        <div className={styles.grid} data-embedded={!showBanner}>
          <section className={styles.faqArea} aria-label="자주 묻는 질문">
            <div className={styles.list}>
              {visibleItems.length > 0 ? (
                visibleItems.map((item) => {
                  const isOpen = openQuestion === item.question;

                  return (
                    <article key={item.question} className={styles.item} data-open={isOpen}>
                      <h2>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                        >
                          <span>
                            <em>Q.</em>
                            {item.question}
                          </span>
                          <Chevron />
                        </button>
                      </h2>
                      {isOpen && <p>{item.fullAnswer.replace(/\s*\n+\s*/g, " ")}</p>}
                    </article>
                  );
                })
              ) : (
                <p className={styles.empty}>검색 결과가 없습니다.</p>
              )}
            </div>

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="FAQ 페이지 탐색">
                <button
                  type="button"
                  aria-label="이전 페이지"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setPage((value) => Math.max(1, value - 1));
                    setOpenQuestion(null);
                  }}
                >
                  <Chevron direction="left" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    aria-label={`${number}페이지`}
                    aria-current={currentPage === number ? "page" : undefined}
                    onClick={() => {
                      setPage(number);
                      setOpenQuestion(null);
                    }}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="다음 페이지"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setPage((value) => Math.min(totalPages, value + 1));
                    setOpenQuestion(null);
                  }}
                >
                  <Chevron direction="right" />
                </button>
              </nav>
            )}
          </section>

          {showBanner && (
            <aside className={styles.contact} aria-labelledby="contact-title">
              <Image src={logo} alt="꼬순박스" width={132} height={44} />
              <h2 id="contact-title">더 질문이 있으신가요?</h2>
              <p>
                원하는 답변을 찾지 못하셨나요?
                <br />
                언제든지 문의해주세요.
              </p>
              <button type="button" onClick={openKakaoChannelChat}>
                카카오톡 상담하기
              </button>
              <Link href="/inquiry">1:1 문의하기</Link>
              <Link href="/support/history">내 문의내역</Link>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
