"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import FaqTitle from "../assets/faq-title.png";
import FaqQuestion from "../assets/faq-question.png";

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
        <span key={`faq-hl-${key++}`} className="text-[var(--color-primary)]">
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
function PawCircleIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]">
      <svg width="31" height="29" viewBox="0 0 31 29" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M14.7196 24.9103C12.8428 23.8439 10.8995 23.1104 8.80587 22.8204C6.60701 22.5158 4.82643 20.9797 4.4787 19.1543C4.11003 17.2187 6.18124 14.2869 9.92968 14.8818C11.4274 14.5606 11.7936 11.666 15.8765 13.094C19.5871 14.9214 18.324 17.7913 19.1892 18.837C21.8404 20.3372 21.7097 23.2427 20.3771 24.5207C19.033 25.8098 16.6827 26.0259 14.7196 24.9103Z"
          fill="var(--color-primary)"
        />
        <path
          d="M21.0535 12.2574C20.065 12.497 19.055 12.1504 18.5636 11.4402C17.2508 9.54558 18.876 6.40188 21.441 5.88632C22.3894 5.69554 23.3439 6.06025 23.8136 6.75083C25.0676 8.5959 23.5566 11.6502 21.0543 12.2575L21.0535 12.2574Z"
          fill="var(--color-primary)"
        />
        <path
          d="M6.40937 12.4638C5.97914 12.1428 5.66931 11.7585 5.45356 11.3422C4.82547 10.1307 4.75034 8.83099 5.23374 7.73973C5.41996 7.31901 5.72293 6.97753 6.14098 6.75171C6.74195 6.42692 7.53902 6.57273 8.14329 7.08455C9.82389 8.50872 9.96629 11.6016 8.40914 12.6218C7.86084 12.9812 7.07393 12.9602 6.40965 12.4646L6.40937 12.4638Z"
          fill="var(--color-primary)"
        />
        <path
          d="M12.1969 9.06815C10.332 7.1994 10.7742 3.60076 12.9553 2.83703C13.7199 2.56904 14.649 2.81421 15.3055 3.46345C17.1351 5.27153 16.8091 8.77812 14.6822 9.67575C13.9099 10.0018 12.9091 9.78186 12.1969 9.06815Z"
          fill="var(--color-primary)"
        />
        <path
          d="M24.1639 18.615C23.308 18.445 22.0617 17.2542 21.9467 16.6158C21.8635 16.1532 21.9661 15.7198 22.2073 15.3259C22.7893 14.3757 23.8543 13.7189 25.1959 13.4562C25.7352 13.3508 26.3434 13.6739 26.8816 13.4729C26.8723 13.4515 28.2715 13.7191 28.3538 14.3752C28.5822 16.1968 26.4951 19.0781 24.1639 18.615Z"
          fill="var(--color-primary)"
        />
        <path
          d="M19.2281 24.8261C18.3124 23.3148 19.6453 21.4104 18.9811 20.6694C18.5939 20.2375 17.838 20.4266 17.4007 20.7418C16.6305 21.2972 15.4601 21.4256 14.7043 20.8772C14.0902 20.4315 13.663 19.7682 13.59 19.1696C13.4746 18.2305 13.8485 17.5188 14.3741 16.8933C15.1539 15.9647 14.1552 13.8221 13.2622 13.0791C14.3953 12.3864 16.4571 13.2293 17.5693 13.8191C18.5162 14.3209 19.2492 15.373 19.3716 16.5912C19.4448 17.32 19.4781 18.1627 20.0526 18.6924C20.7913 19.3741 21.4016 20.1441 21.4812 21.2028C21.6002 22.788 20.7578 24.736 19.2281 24.8261Z"
          fill="var(--color-text)"
        />
        <path
          d="M6.64154 8.73952C8.33201 10.2759 8.78746 12.5118 7.8849 12.8278C7.46423 12.9748 6.6913 12.7923 6.37337 12.4766C5.22114 11.3319 4.71138 9.73587 5.05 8.33405C5.5379 8.08776 6.23057 8.36484 6.64275 8.73953L6.64154 8.73952Z"
          fill="var(--color-text)"
        />
        <path
          d="M11.8909 16.6256C11.8007 17.9034 11.0194 18.9782 10.2961 18.9908C9.86121 18.998 9.42139 18.7063 9.21499 18.3384C8.59806 17.2396 8.49534 16.0355 9.16527 14.9663C10.3332 15.1369 10.5804 14.3539 11.1178 14.0652C11.8543 14.6172 11.9567 15.7154 11.8917 16.6273L11.8909 16.6256Z"
          fill="var(--color-text)"
        />
        <path
          d="M28.5613 14.6264C26.3029 15.1539 27.3193 15.5009 25.2133 16.151C24.774 16.286 23.652 15.9951 23.9546 15.2205C24.3161 13.9908 27.8584 12.5517 28.5613 14.6264Z"
          fill="var(--color-text)"
        />
      </svg>
    </div>
  );
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
    <div className="min-h-screen bg-white py-10 max-md:py-8 md:py-[50px]">
      <div className="mx-auto flex w-full max-w-[1013px] flex-col gap-6 px-4 max-md:px-4 md:px-8">
        {/* ── 페이지 타이틀: Gangwon → PNG (faq-title) / 부제: Griun PolFairness ── */}
        <header className="flex flex-col items-center gap-3 text-center">
          <Image
            src={FaqTitle}
            width={172}
            height={25}
            alt="꼬순박스 고객센터"
            className="h-[25px] w-auto"
            priority
          />
          <p
            className="max-w-[415px] text-[16px] font-normal leading-[150%] tracking-[-0.02em] text-[var(--color-text)]"
            style={{
              fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
            }}
          >
            궁금하거나 요청하실 사항이 있으시면 상세히 안내해 드리겠습니다.
          </p>
        </header>

        {/* ── CTA 배너 (Figma 118px, gradient, pill 버튼) ── */}
        <section
          className="flex min-h-[118px] flex-col items-stretch justify-center gap-4 rounded-[20px] mt-4 px-6 py-6 max-md:py-6 md:flex-row md:items-center md:justify-between md:gap-6 md:px-11 md:py-0"
          style={{ background: "var(--gradient-support-banner)" }}
          aria-label="1:1 문의 안내"
        >
          <div className="flex w-full flex-col gap-[11px] max-md:items-center max-md:text-center md:max-w-[330px] md:items-start md:text-left">
            <Image
              src={FaqQuestion}
              alt="꼬순박스에 궁금한 점이 있으신가요?"
              width={FaqQuestion.width}
              height={FaqQuestion.height}
              sizes="(max-width: 767px) 100vw, 320px"
              className="h-auto max-md:w-full md:w-[320px]"
            />
            <p className="text-[14px] font-medium capitalize leading-[17px] tracking-[-0.04em] text-[var(--color-text)] max-md:text-center md:text-left">
              1:1 문의를 남겨주시면 담당자가 확인 후 빠르게 답변해 드립니다.
            </p>
          </div>
          <Link
            href="/inquiry"
            className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-[30px] bg-[var(--color-accent)] px-6 py-[13px] text-center text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white max-md:max-w-none md:w-[200px]"
          >
            문의하기
          </Link>
        </section>

        {/* ── FAQ 패널 (#FFF7EF) ── */}
        <section
          className="rounded-[20px] bg-[var(--color-support-faq-surface)] px-5 py-8 max-md:px-4 max-md:py-6 md:px-[45px] md:pb-7 md:pt-6"
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
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-medium leading-[17px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
              />
            </label>
            <div className="flex justify-center md:justify-end">
              <Link
                href="/inquiry"
                className="text-right text-[14px] font-medium leading-[17px] tracking-[-0.04em] text-[var(--color-accent)] underline underline-offset-2"
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
                  className="flex min-h-[208px] flex-col gap-3 rounded-[20px] bg-white p-4 md:p-4"
                >
                  <PawCircleIcon />
                  <div className="flex flex-col gap-2">
                    <p className="text-body-14-sb text-[var(--color-text)]">
                      {highlightMatch(item.question, query)}
                    </p>
                    <p className="text-[14px] font-medium leading-5 text-[var(--color-text)]">
                      {highlightMatch(item.answer, query)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-16">
              <p className="text-[16px] text-[var(--color-text-secondary)]">검색 결과가 없습니다.</p>
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
                        ? "flex h-6 min-w-[24px] items-center justify-center bg-transparent text-[13px] font-semibold leading-4 text-[var(--color-text)]"
                        : "flex h-6 min-w-[24px] items-center justify-center bg-transparent text-[13px] font-normal leading-4 text-[var(--color-text)]"
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
