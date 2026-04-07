"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Mock 데이터 ─────────────────────────────────────────── */
const PAYMENT_INFO = {
  packageName: "프리미엄 패키지 구독중",
  method: "신용카드 결제",
  card: "국민카드 ( 1234 - **** - **** - **** )",
  nextDate: "2026.04.21 (카드결제)",
};

type PaymentStatus = "예정" | "완료";

interface PaymentRecord {
  id: number;
  packageName: string;
  status: PaymentStatus;
  amount: number;
  date: string;
}

const ALL_RECORDS: PaymentRecord[] = [
  { id: 1,  packageName: "프리미엄 패키지", status: "예정", amount: 25000, date: "2026.04.21" },
  { id: 2,  packageName: "프리미엄 패키지", status: "완료", amount: 25000, date: "2026.04.21" },
  { id: 3,  packageName: "프리미엄 패키지", status: "완료", amount: 25000, date: "2026.03.21" },
  { id: 4,  packageName: "프리미엄 패키지", status: "완료", amount: 25000, date: "2026.02.21" },
  { id: 5,  packageName: "프리미엄 패키지", status: "완료", amount: 25000, date: "2026.01.21" },
  { id: 6,  packageName: "프리미엄 패키지", status: "완료", amount: 20000, date: "2025.12.21" },
  { id: 7,  packageName: "스탠다드 패키지", status: "완료", amount: 20000, date: "2025.11.21" },
  { id: 8,  packageName: "스탠다드 패키지", status: "완료", amount: 20000, date: "2025.10.21" },
  { id: 9,  packageName: "스탠다드 패키지", status: "완료", amount: 20000, date: "2025.09.21" },
  { id: 10, packageName: "스탠다드 패키지", status: "완료", amount: 20000, date: "2025.08.21" },
  { id: 11, packageName: "스탠다드 패키지", status: "완료", amount: 20000, date: "2025.07.21" },
  { id: 12, packageName: "스탠다드 패키지", status: "완료", amount: 20000, date: "2025.06.21" },
  { id: 13, packageName: "스탠다드 패키지", status: "완료", amount: 20000, date: "2025.05.21" },
  { id: 14, packageName: "베이직 패키지",   status: "완료", amount: 15000, date: "2025.04.21" },
  { id: 15, packageName: "베이직 패키지",   status: "완료", amount: 15000, date: "2025.03.21" },
  { id: 16, packageName: "베이직 패키지",   status: "완료", amount: 15000, date: "2025.02.21" },
  { id: 17, packageName: "베이직 패키지",   status: "완료", amount: 15000, date: "2025.01.21" },
  { id: 18, packageName: "베이직 패키지",   status: "완료", amount: 15000, date: "2024.12.21" },
  { id: 19, packageName: "베이직 패키지",   status: "완료", amount: 15000, date: "2024.11.21" },
  { id: 20, packageName: "베이직 패키지",   status: "완료", amount: 15000, date: "2024.10.21" },
];

const ITEMS_PER_PAGE = 5;

/* ── 공통 스타일 ─────────────────────────────────────────── */
const LABEL_CLS =
  "text-body-13-m text-[var(--color-text-label)] w-[80px] shrink-0";
const VALUE_CLS =
  "text-body-13-sb text-[var(--color-text)]";

/* ── 아이콘 ──────────────────────────────────────────────── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12 4L6 10l6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H16M15 11L12 14M12 14L9 11M12 14L12 4"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {dir === "left" ? (
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/* ── 상태 뱃지 ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: PaymentStatus }) {
  return status === "예정" ? (
    <span className="inline-flex items-center rounded-full px-3 py-0.5 text-btn-12-m bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]">
      예정
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full px-3 py-0.5 text-btn-12-m bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]">
      완료
    </span>
  );
}

/* ── 페이지네이션 ─────────────────────────────────────────── */
function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onSelect,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-2 pt-4 pb-2" aria-label="결제내역 페이지 탐색">
      <button
        onClick={onPrev}
        disabled={page === 1}
        aria-label="이전 페이지"
        className="flex h-5 w-5 items-center justify-center text-[var(--color-ui-disabled)] disabled:opacity-40"
      >
        <ChevronIcon dir="left" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          aria-current={page === p ? "page" : undefined}
          className={[
            "flex h-5 w-5 items-center justify-center rounded-full text-body-13-r",
            page === p ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
      <button
        onClick={onNext}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        className="flex h-5 w-5 items-center justify-center text-[var(--color-ui-disabled)] disabled:opacity-40"
      >
        <ChevronIcon dir="right" />
      </button>
    </nav>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────────── */
export default function PaymentManagementSection() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(ALL_RECORDS.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, totalPages);
  const records = ALL_RECORDS.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const paginationProps = {
    page: currentPage,
    totalPages,
    onPrev: () => setPage((p) => Math.max(1, p - 1)),
    onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
    onSelect: setPage,
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* ━━━━━━━━ 모바일 레이아웃 ━━━━━━━━ */}
      <div className="md:hidden pb-12">
        {/* 헤더 */}
        <div className="flex items-center gap-2 px-6 py-5">
          <Link
            href="/mypage"
            aria-label="마이페이지로 돌아가기"
            className="flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          >
            <BackIcon />
          </Link>
          <h1 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
            결제관리
          </h1>
        </div>

        <div className="flex flex-col gap-4 px-4">
          {/* 결제 정보 카드 */}
          <div className="rounded-2xl bg-white px-6 py-5">
            <p className="mb-4 text-subtitle-16-b text-[var(--color-text)]">
              결제관리
            </p>

            {/* 결제수단 */}
            <div className="flex items-center gap-3 py-2.5">
              <span className={LABEL_CLS}>결제수단</span>
              <span className={VALUE_CLS}>{PAYMENT_INFO.method}</span>
            </div>

            {/* 간편결제 */}
            <div className="flex items-start gap-3 py-2.5">
              <span className={LABEL_CLS}>간편 결제</span>
              <div className="flex flex-col gap-2">
                <span className={VALUE_CLS}>{PAYMENT_INFO.card}</span>
                <button
                  type="button"
                  className="inline-flex w-[88px] h-[24px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-accent)] text-body-13-m text-white hover:opacity-90 transition-opacity"
                >
                  결제등록/변경
                </button>
              </div>
            </div>

            {/* 다음 결제일 */}
            <div className="flex items-center gap-3 py-2.5">
              <span className={LABEL_CLS}>다음 결제일</span>
              <span className={VALUE_CLS}>{PAYMENT_INFO.nextDate}</span>
            </div>
          </div>

          {/* 결제 내역 카드 */}
          <div className="rounded-2xl bg-white px-5">
            <ul>
              {records.map((record) => (
                <li
                  key={record.id}
                  className="border-b border-[var(--color-text-muted)] last:border-b-0"
                >
                  <div className="py-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body-14-m text-[var(--color-text)]">
                        {record.packageName}
                      </span>
                      <StatusBadge status={record.status} />
                      {record.status === "예정" && (
                        <Link
                          href="/subscribe"
                          className="text-body-14-m text-[var(--color-accent)] underline"
                        >
                          구독 변경
                        </Link>
                      )}
                      <button
                        type="button"
                        aria-label={`${record.date} 영수증 다운로드`}
                        className="ml-auto hover:opacity-70 transition-opacity"
                      >
                        <ShareIcon />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-14-m text-[var(--color-text)]">
                        {record.amount.toLocaleString("ko-KR")}원
                      </span>
                      <span className="text-body-14-m text-[var(--color-text-tertiary)]">
                        {record.date}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination {...paginationProps} />
          </div>
        </div>
      </div>

      {/* ━━━━━━━━ 데스크톱 레이아웃 ━━━━━━━━ */}
      <div className="max-md:hidden py-10">
        <div className="mx-auto max-w-content px-8">
          <div className="rounded-2xl bg-white px-8 py-8">
            {/* ← 뒤로가기 + 타이틀 */}
            <div className="mb-6 flex items-center gap-2">
              <Link
                href="/mypage"
                aria-label="마이페이지로 돌아가기"
                className="flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <BackIcon />
              </Link>
              <h1 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
                결제관리
              </h1>
            </div>

            {/* 결제 정보 회색 박스 */}
            <div className="mb-4 rounded-2xl bg-[var(--color-surface-light)] px-8 py-6">
              <p className="mb-4 text-subtitle-16-b text-[var(--color-text)]">
                {PAYMENT_INFO.packageName}
              </p>
              <div className="flex items-center gap-0 mb-4">
                <span className={LABEL_CLS}>결제수단</span>
                <span className={VALUE_CLS}>{PAYMENT_INFO.method}</span>
              </div>
              <div className="flex items-center gap-0 mb-4">
                <span className={LABEL_CLS}>간편 결제</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={VALUE_CLS}>{PAYMENT_INFO.card}</span>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-[4px] bg-[var(--color-accent)] px-2 py-[4px] text-body-13-m text-white hover:opacity-90 transition-opacity"
                  >
                    결제등록/변경
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-0">
                <span className={LABEL_CLS}>다음 결제일</span>
                <span className={VALUE_CLS}>{PAYMENT_INFO.nextDate}</span>
              </div>
            </div>

            {/* 결제 내역 테이블 */}
            <div>
              {/* 헤더 바 */}
              <div className="grid grid-cols-[1fr_90px_130px_56px] items-center rounded-lg bg-[var(--color-surface-light)] px-8 py-3 mb-0">
                <span className="text-body-16-m text-[var(--color-text-tertiary)]">구독</span>
                <span className="text-body-16-m text-[var(--color-text-tertiary)]">금액</span>
                <span className="text-body-16-m text-[var(--color-text-tertiary)]">직접입력</span>
                <span className="text-body-16-m text-[var(--color-text-tertiary)] text-center">영수증</span>
              </div>

              <ul>
                {records.map((record) => (
                  <li
                    key={record.id}
                    className="border-b border-[var(--color-text-muted)] last:border-b-0"
                  >
                    <div className="grid grid-cols-[1fr_90px_130px_56px] items-center px-8 py-[14px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-body-14-m text-[var(--color-text)]">
                          {record.packageName}
                        </span>
                        <StatusBadge status={record.status} />
                        {record.status === "예정" && (
                          <Link
                            href="/subscribe"
                            className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
                          >
                            플랜 변경하기
                          </Link>
                        )}
                      </div>
                      <span className="text-body-14-m text-[var(--color-text)]">
                        {record.amount.toLocaleString("ko-KR")}원
                      </span>
                      <span className="text-body-14-m text-[var(--color-text)]">
                        {record.date}
                      </span>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          aria-label={`${record.date} 영수증 다운로드`}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <ShareIcon />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Pagination {...paginationProps} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
