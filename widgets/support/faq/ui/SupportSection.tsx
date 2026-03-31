"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Text } from "@/shared/ui";

const FAQ_ITEMS = [
  {
    question: "내 아이에게 맞는 플랜은 무엇인가요?",
    answer:
      "구독 신청 전 체크리스트를 작성해주시면 아이에게 딱 맞는 구독 플랜을 추천드립니다!",
  },
  {
    question: "알레르기가 있는 아이도 먹을 수 있나요?",
    answer:
      "네 가능합니다. 주문 전 체크리스트를 작성하시면 '못 먹는 원재료'의 해당 성분을 제외한 대체 간식으로 맞춤 구성하여 보내드립니다. 아이의 건강을 최우선으로 생각합니다.",
  },
  {
    question: "정기 구독 배송일은 언제인가요?",
    answer:
      "매달 지정하신 결제일에 맞춰 신선하게 제작된 후 2~3일 내로 발송됩니다. 배송 시작 시 알림톡으로 송장 번호를 안내해 드리고 있습니다.",
  },
  {
    question: "이번 달만 건너뛰거나 해지할 수 있나요?",
    answer:
      "마이페이지에서 언제든 '이번 달 건너뛰기' 또는 '구독 해지'가 가능합니다. 단, 이미 제작이 시작된 경우에는 다음 달부터 적용되니 결제일 전 확인 부탁드립니다.",
  },
  {
    question: "보관 방법과 유통기한이 궁금해요!",
    answer:
      "방부제가 들어있지 않은 수제 간식이므로 수령 후 즉시 냉장 또는 냉동 보관을 권장합니다. 냉장은 7일, 냉동은 제조일로부터 한 달까지 유지 가능합니다.",
  },
  {
    question: "플랜을 중간에 변경할 수 있나요?",
    answer:
      "네, 마이페이지 '구독 관리'에서 언제든지 베이직, 스탠다드, 프리미엄 간의 플랜 변경이 가능합니다. 변경된 구성은 다음 결제 회차부터 적용됩니다.",
  },
  {
    question: "첫 구독 주문은 언제 배송되나요?",
    answer:
      "결제 완료 후 영업일 기준 2~3일 내에 제작하여 발송됩니다. 배송 시작 시 카카오 알림톡으로 안내드립니다.",
  },
  {
    question: "결제 수단은 어떤 것이 가능한가요?",
    answer:
      "신용카드, 체크카드, 카카오페이, 네이버페이 등 주요 간편결제 수단을 모두 지원합니다.",
  },
  {
    question: "주소 변경은 어떻게 하나요?",
    answer:
      "마이페이지 > 배송지 관리에서 언제든지 주소를 변경하실 수 있습니다. 단, 이미 제작이 시작된 주문은 주소 변경이 어려울 수 있으니 결제 전에 확인 부탁드립니다.",
  },
  {
    question: "간식의 원산지는 어디인가요?",
    answer:
      "꼬순박스의 모든 간식은 국내산 재료만을 사용하여 만들어집니다. 원산지와 성분은 제품 패키지에 상세히 표기되어 있습니다.",
  },
  {
    question: "반려견이 간식을 안 먹으면 어떻게 되나요?",
    answer:
      "처음 먹는 간식에 낯설어하는 반려견도 있어요. 고객센터로 문의 주시면 담당자가 빠르게 확인 후 도움을 드리겠습니다.",
  },
  {
    question: "구독 선물도 가능한가요?",
    answer:
      "네, 선물 수령인 정보로 배송지를 설정하시면 선물로 보내실 수 있습니다. 선물 포장 옵션도 주문 시 선택 가능합니다.",
  },
];

const ITEMS_PER_PAGE = 6;

function PawCircleIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary)]">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="15.5" rx="5" ry="4" fill="var(--color-primary)" />
        <ellipse cx="6.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse cx="10" cy="8.5" rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse cx="14" cy="8.5" rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse cx="17.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      </svg>
    </div>
  );
}

export default function SupportSection() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      {/* Page header */}
      <section className="pt-12 pb-8 text-center px-6">
        <Text
          as="h1"
          variant="title-24-b"
          className="text-[var(--color-primary)]"
        >
          꼬순박스 고객센터
        </Text>
        <Text
          variant="body-16-r"
          className="mt-2 text-[var(--color-text-secondary)]"
        >
          궁금하거나 요청하실 사항이 있으시면 상세히 안내해 드리겠습니다.
        </Text>
      </section>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 pb-16 md:px-8">
        {/* CTA card */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[var(--color-card-standard)] px-8 py-7 md:flex-row md:items-center">
          <div>
            <Text
              as="h2"
              variant="subtitle-20-b"
              className="text-[var(--color-brown-dark)]"
            >
              꼬순박스에 궁금한 점이 있으신가요?
            </Text>
            <Text
              variant="body-16-r"
              className="mt-1 text-[var(--color-text-secondary)]"
            >
              1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다.
            </Text>
          </div>
          <Link
            href="/inquiry"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-8 text-white h-[44px] text-[16px] font-semibold leading-[24px] tracking-[-0.02em]"
          >
            문의하기
          </Link>
        </div>

        {/* FAQ section */}
        <div className="rounded-2xl border border-[var(--color-text-muted)] bg-white px-6 py-8 md:px-10 md:py-10">
          {/* Search */}
          <div className="relative mb-8">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 12l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="질문을 검색하세요"
              value={query}
              onChange={handleQueryChange}
              className="w-full rounded-full border border-[var(--color-text-muted)] bg-[var(--color-surface-light)] py-3 pl-11 pr-4 text-body-14-r text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:bg-white"
            />
          </div>

          {/* Grid */}
          {currentItems.length > 0 ? (
            <ul className="grid gap-4 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--color-text-muted)] bg-white p-6"
                >
                  <PawCircleIcon />
                  <Text
                    as="h3"
                    variant="subtitle-16-sb"
                    className="text-[var(--color-text)]"
                  >
                    {item.question}
                  </Text>
                  <Text
                    variant="body-13-r"
                    className="text-[var(--color-text-secondary)]"
                  >
                    {item.answer}
                  </Text>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-16 text-[var(--color-text-secondary)]">
              <Text variant="body-16-r">검색 결과가 없습니다.</Text>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-1"
              aria-label="FAQ 페이지 탐색"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] disabled:opacity-30 hover:bg-[var(--color-surface-light)]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-label={`${p}페이지`}
                  aria-current={currentPage === p ? "page" : undefined}
                  className={[
                    "h-8 w-8 rounded-full text-body-14-m",
                    currentPage === p
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] disabled:opacity-30 hover:bg-[var(--color-surface-light)]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
