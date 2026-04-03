"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FaqTitle from "../../faq/assets/faq-title.png";
import FaqQuestion from "../../faq/assets/faq-question.png";
import PawCircleIcon from "../../shared/ui/PawCircleIcon";

const ITEMS_PER_PAGE = 4;

type InquiryRecord = { id: string; title: string; body: string };

const INITIAL_MOCK: InquiryRecord[] = [
  {
    id: "1",
    title: "내 아이에게 맞는 플랜은 무엇인가요?",
    body: "구독 신청 전 체크리스트를 작성해주시면 아이에게 딱 맞는 구독 플랜을 추천드립니다!",
  },
  {
    id: "2",
    title: "알레르기가 있는 아이도 먹을 수 있나요?",
    body: "네 가능합니다, 주문 전 체크리스트를 작성하시면 '못 먹는 원재료'의 해당 성분을 제외한 대체 간식으로 맞춤 구성하여 보내드립니다. 아이의 건강을 최우선으로 생각합니다.",
  },
  {
    id: "3",
    title: "정기 구독 배송일은 언제인가요?",
    body: "매달 지정하신 결제일에 맞춰 신선하게 제작된 후 2~3일 내로 발송됩니다. 배송 시작 시 알림톡으로 송장 번호를 안내해 드리고 있습니다.",
  },
  {
    id: "4",
    title: "이번 달만 건너뛰거나 해지할 수 있나요?",
    body: "마이페이지에서 언제든 '이번 달 건너뛰기' 또는 '구독 해지'가 가능합니다. 단, 이미 제작이 시작된 경우에는 다음 달부터 적용되니 결제일 전 확인 부탁드립니다.",
  },
  {
    id: "5",
    title: "배송 일정 문의",
    body: "이번 주 주문 건은 결제 확인 후 수요일 출고 예정입니다. 송장은 출고 당일 알림톡으로 안내드립니다.",
  },
  {
    id: "6",
    title: "구독 플랜 변경",
    body: "스탠다드에서 프리미엄으로 변경 요청 접수되었습니다. 다음 결제일부터 새 구성이 적용됩니다.",
  },
  {
    id: "7",
    title: "결제 오류",
    body: "카드사 승인 지연으로 일시 오류가 있었습니다. 재시도 후 정상 결제 확인되었습니다. 불편을 드려 죄송합니다.",
  },
  {
    id: "8",
    title: "선물 배송지 수정",
    body: "선물 수령인 연락처만 변경 가능하며, 출고 전까지 수정 완료했습니다.",
  },
  {
    id: "9",
    title: "간식 보관 문의",
    body: "개봉 후 냉장 보관 시 일주일, 냉동 보관 시 한 달 권장드립니다. 실온 장시간 보관은 피해 주세요.",
  },
  {
    id: "10",
    title: "휴무일 배송",
    body: "공휴일 전후로 택배사 집하가 지연될 수 있어 하루 정도 늦어질 수 있습니다.",
  },
  {
    id: "11",
    title: "영수증 발급",
    body: "결제 완료 메일에 영수증 링크가 포함되어 있습니다. 별도 발급이 필요하면 말씀해 주세요.",
  },
  {
    id: "12",
    title: "첫 구독 할인",
    body: "첫 달 프로모션 코드 적용 여부 확인 후 안내드렸습니다. 다음 회차부터는 정상가로 청구됩니다.",
  },
  {
    id: "13",
    title: "패키지 파손",
    body: "배송 중 파손 확인되어 동일 구성으로 재발송 처리했습니다. 사진 첨부 감사합니다.",
  },
  {
    id: "14",
    title: "구독 일시 정지",
    body: "한 달 건너뛰기로 반영했습니다. 재개 원하시면 마이페이지에서 날짜만 선택해 주시면 됩니다.",
  },
  {
    id: "15",
    title: "제품 구성 문의",
    body: "이번 달 박스에는 표시된 구성 외 샘플 간식 1종이 포함되어 있습니다.",
  },
  {
    id: "16",
    title: "맞춤 구성 변경",
    body: "다음 달 구성 변경 요청 접수되었습니다. 결제 전날까지 변경 가능하오니 참고 부탁드립니다.",
  },
  {
    id: "17",
    title: "구독 재개 문의",
    body: "일시 정지 해제 후 다음 결제일 기준으로 자동 재개됩니다. 추가 설정은 필요하지 않습니다.",
  },
  {
    id: "18",
    title: "샘플 간식 요청",
    body: "박스 구성 내 샘플 요청은 접수 기준 다음 달부터 반영됩니다. 원하시는 종류를 알려주시면 최대한 맞춰드리겠습니다.",
  },
  {
    id: "19",
    title: "결제 수단 변경",
    body: "마이페이지에서 직접 카드 정보를 변경하실 수 있습니다. 다음 결제일 전까지 변경하시면 바로 적용됩니다.",
  },
  {
    id: "20",
    title: "포인트 적립 문의",
    body: "결제 완료 후 3영업일 내로 포인트가 적립됩니다. 적립 내역은 마이페이지에서 확인하실 수 있습니다.",
  },
];

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

  const totalPages = Math.max(1, Math.ceil(INITIAL_MOCK.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const currentItems = useMemo(
    () => INITIAL_MOCK.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage],
  );

  return (
    <div className="min-h-screen bg-white py-10 max-md:py-8 md:py-[50px]">
      <div className="mx-auto flex w-full max-w-[1013px] flex-col gap-6 px-4 max-md:px-4 md:px-8">
        <header className="max-md:hidden flex flex-col items-center gap-3 text-center">
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

          {currentItems.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {currentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[20px] bg-white p-4 md:p-4"
                >
                  <PawCircleIcon />
                  <div className="flex flex-col gap-2">
                    <p className="text-body-14-sb text-[var(--color-text)]">{item.title}</p>
                    <p className="text-[14px] font-medium leading-5 text-[var(--color-text)]">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-16">
              <p className="text-[16px] text-[var(--color-text-secondary)]">문의 내역이 없습니다.</p>
              <Link
                href="/inquiry"
                className="mt-4 text-[14px] font-medium text-[var(--color-accent)] underline underline-offset-2"
              >
                문의하기
              </Link>
            </div>
          )}

          {totalPages > 1 && (
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
