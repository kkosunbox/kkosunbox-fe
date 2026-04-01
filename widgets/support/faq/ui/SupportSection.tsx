"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Text } from "@/shared/ui";

/* ── FAQ 데이터 ──────────────────────────────────────────── */
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

/* ── 아이콘 ──────────────────────────────────────────────── */
function PawCircleIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="15.5" rx="5" ry="4" fill="var(--color-primary)" />
        <ellipse cx="6.5"  cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse cx="10"   cy="8.5"  rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse cx="14"   cy="8.5"  rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse cx="17.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      </svg>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" stroke="var(--color-text-secondary)" strokeWidth="1.22" />
      <path d="M10.5 10.5L13.5 13.5" stroke="var(--color-text-secondary)" strokeWidth="1.22" strokeLinecap="round" />
    </svg>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────────── */
export default function SupportSection() {
  const [query, setQuery]   = useState("");
  const [page, setPage]     = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [query]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage  = Math.min(page, totalPages);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="bg-white min-h-screen py-12 md:py-[50px]">
      <div className="mx-auto max-w-[var(--max-width-content)] px-4 md:px-8 flex flex-col gap-6">

        {/* ── 배너 카드 ── */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl px-8 md:px-14 py-7 md:h-[124px]"
          style={{ background: "var(--gradient-support-banner)" }}
        >
          <div className="flex flex-col gap-1">
            <p
              className="text-[24px] leading-[25px] tracking-[-0.04em] text-[var(--color-brown)]"
              style={{ fontFamily: "'GangwonEduPower', sans-serif" }}
            >
              꼬순박스에 궁금한 점이 있으신가요?
            </p>
            <Text variant="body-16-m" className="text-[var(--color-text)]">
              1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다.
            </Text>
          </div>
          <Link
            href="/inquiry"
            className="shrink-0 inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white w-full md:w-[200px] h-[48px] text-[16px] font-semibold leading-[150%] tracking-[-0.02em]"
          >
            문의하기
          </Link>
        </div>

        {/* ── FAQ 섹션 ── */}
        <div className="rounded-2xl bg-[var(--color-background)] px-6 py-8 md:px-[45px] md:py-10">

          {/* 검색창 */}
          <div className="flex justify-center mb-8">
            <label className="relative w-full md:w-[320px]">
              <span className="sr-only">질문 검색</span>
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="질문을 검색하세요"
                value={query}
                onChange={handleQueryChange}
                className="w-full h-[40px] rounded-full bg-white pl-[38px] pr-5 text-[14px] font-medium leading-[17px] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none"
                style={{ boxShadow: "0px 0.74px 1.47px rgba(16, 24, 40, 0.05)" }}
              />
            </label>
          </div>

          {/* 카드 그리드 */}
          {currentItems.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex flex-col gap-3 rounded-2xl bg-white p-4 md:p-[16px] min-h-[208px]"
                >
                  <PawCircleIcon />
                  <p className="text-body-14-sb text-[var(--color-text)] mt-1">
                    {item.question}
                  </p>
                  <Text variant="body-14-m" className="text-[var(--color-text)]">
                    {item.answer}
                  </Text>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-16">
              <Text variant="body-16-r" className="text-[var(--color-text-secondary)]">
                검색 결과가 없습니다.
              </Text>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-2"
              aria-label="FAQ 페이지 탐색"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
                className="flex h-5 w-5 items-center justify-center text-[var(--color-text-muted)] disabled:opacity-40"
              >
                <ChevronLeftIcon />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-label={`${p}페이지`}
                  aria-current={currentPage === p ? "page" : undefined}
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-full text-[13px] leading-[16px] font-normal",
                    currentPage === p
                      ? "text-[var(--color-text)]"
                      : "text-[var(--color-text-secondary)]",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
                className="flex h-5 w-5 items-center justify-center text-[var(--color-text-muted)] disabled:opacity-40"
              >
                <ChevronRightIcon />
              </button>
            </nav>
          )}

        </div>
      </div>
    </div>
  );
}
