"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/shared/ui";
import FaqTitle from "../assets/faq-title.png";
import FaqQuestion from "../assets/faq-question.png";
import PawCircleIcon from "../../shared/ui/PawCircleIcon";

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

/* ── 메인 컴포넌트 ───────────────────────────────────────── */
export default function SupportSection() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

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
    <div className="min-h-screen bg-white max-md:py-6 md:py-10">
      <div className="mx-auto flex w-full max-w-[1013px] flex-col gap-4 md:gap-6 px-4 max-md:px-4 md:px-8">
        {/* ── 페이지 타이틀: Gangwon → PNG (faq-title) / 부제: Griun PolFairness ── */}
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

        {/* ── CTA 배너 (Figma 118px, gradient, pill 버튼) ── */}
        <ScrollReveal variant="fade-up">
          <section
            className="flex min-h-[118px] flex-col items-stretch justify-center gap-4 rounded-[20px] px-6 py-6 max-md:py-6 md:flex-row md:items-center md:justify-between md:gap-6 md:px-11 md:py-0"
            style={{ background: "var(--gradient-support-banner)" }}
            aria-label="1:1 문의 안내"
          >
            <div className="flex w-full flex-col gap-[11px] max-md:items-center max-md:text-center md:max-w-[330px] md:items-start md:text-left">
              <Image
                src={FaqQuestion}
                alt="꼬순박스에 궁금한 점이 있으신가요?"
                width={FaqQuestion.width}
                height={FaqQuestion.height}
                sizes="(max-width: 767px) 220px, 320px"
                className="h-auto max-md:w-[220px] md:w-[320px]"
              />
              <p className="text-body-14-m capitalize leading-[17px] tracking-[-0.04em] text-[var(--color-text)] max-md:text-center md:text-left">
                1:1 문의를 남겨주시면 담당자가 확인 후
                <br className="md:hidden" />
                {" "}빠르게 답변해 드립니다.
              </p>
            </div>
            <Link
              href="/inquiry"
              className="inline-flex h-[40px] shrink-0 items-center justify-center rounded-[30px] bg-[var(--color-accent)] px-6 text-center max-md:text-body-14-sb text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white max-md:mx-auto max-md:w-full max-md:max-w-[410px] md:w-[200px]"
            >
              문의하기
            </Link>
          </section>
        </ScrollReveal>

        {/* ── 모바일 전용: 내 문의내역 (두 섹션 사이) ── */}
        <ScrollReveal variant="fade-in" delay={200} className="flex justify-center md:hidden">
          <Link
            href="/support/history"
            className="text-body-14-m leading-[17px] tracking-[-0.04em] text-[var(--color-accent)] underline underline-offset-2"
          >
            내 문의내역
          </Link>
        </ScrollReveal>

        {/* ── FAQ 패널 (#FFF7EF) ── */}
        <ScrollReveal variant="fade-up" delay={150}>
          <section
            className="rounded-[20px] bg-[var(--color-support-faq-surface)] py-8 max-md:px-5 max-md:py-5 md:px-[45px] md:pb-7 md:pt-6"
            aria-label="자주 묻는 질문"
          >
          {/* 검색 + 내 문의내역 */}
          <div className="mb-6 grid w-full grid-cols-1 gap-3 md:mb-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div aria-hidden="true" className="max-md:hidden" />
            <label className="mx-auto flex h-10 max-md:w-full cursor-text items-center gap-2 rounded-full bg-white px-5 py-2 shadow-[0px_0.73544px_1.47088px_rgba(16,24,40,0.05)] md:mx-0 md:w-[320px] md:shrink-0">
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
            <div className="max-md:hidden flex justify-end">
              <Link
                href="/support/history"
                className="text-right text-body-14-m leading-[17px] tracking-[-0.04em] text-[var(--color-accent)] underline underline-offset-2"
              >
                내 문의내역
              </Link>
            </div>
          </div>

          {currentItems.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {currentItems.map((item) => (
                <li
                  key={item.question}
                  className="flex flex-col gap-3 rounded-[20px] bg-white p-4 md:min-h-[208px] md:p-4"
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
  );
}
