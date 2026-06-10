"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PointBalance, PointLedgerItem } from "@/features/point/api/types";
import type { MyReferralCode } from "@/features/referral/api/types";
import { useModal } from "@/shared/ui";

const ITEMS_PER_PAGE = 10;

type SortTab = "all" | "earn" | "date";

function fmtDate(d: string | null | undefined): string {
  if (!d) return "-";
  return d.slice(0, 10).replace(/-/g, ".");
}

function fmtPoint(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}${amount.toLocaleString("ko-KR")}P`;
}

function computeRunningBalances(items: PointLedgerItem[], currentBalance: number): number[] {
  let running = currentBalance;
  return items.map((item) => {
    const rb = running;
    running -= item.amount;
    return rb;
  });
}

/* ── 아이콘 ────────────────────────────────────────────────────────── */
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6L9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12l5 5L20 7" stroke="var(--color-cta-button)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="1.5" stroke="#B0B0B0" strokeWidth="2" />
      <path d="M15 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {dir === "left" ? (
        <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6.66667 5.83333V2.5M13.3333 5.83333V2.5M5.83333 9.16667H14.1667M4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V5.83333C17.5 4.91286 16.7538 4.16667 15.8333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type PickerView = "month" | "year";

function PickerChevronIcon({ dir }: { dir: "up" | "down" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      {dir === "down" ? (
        <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M2.5 7.5L6 4l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function buildYearRange(anchorYear: number): number[] {
  const end = Math.max(anchorYear, new Date().getFullYear());
  const start = end - 10;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/* ── 년/월 picker (말풍선) ─────────────────────────────────────────── */
function YearMonthPicker({
  year,
  month,
  tailLeft,
  onSelect,
}: {
  year: number;
  month: number;
  tailLeft: number;
  onSelect: (y: number, m: number) => void;
}) {
  const [pickerYear, setPickerYear] = useState(year);
  const [view, setView] = useState<PickerView>("month");

  useEffect(() => {
    setPickerYear(year);
    setView("month");
  }, [year]);

  const years = buildYearRange(pickerYear);

  return (
    <div
      className="absolute left-0 top-[calc(100%+10px)] z-50 w-[280px]"
      role="dialog"
      aria-label="년월 선택"
    >
      {/* 말풍선 꼬리 */}
      <div
        className="pointer-events-none absolute -top-[6px] h-3 w-3 rotate-45 bg-white"
        style={{ left: tailLeft, boxShadow: "-2px -2px 4px rgba(0,0,0,0.04)" }}
        aria-hidden="true"
      />
      <div className="relative rounded-[20px] bg-white px-6 py-5 shadow-[0px_8px_24px_rgba(0,0,0,0.12)]">
        <div className="mb-5 flex items-center gap-4">
          <span className="text-body-16-b tracking-[-0.04em] text-[var(--color-text)]">
            {String(month).padStart(2, "0")}월
          </span>
          <button
            type="button"
            onClick={() => setView((v) => (v === "year" ? "month" : "year"))}
            className="flex items-center gap-1 text-body-16-b tracking-[-0.04em] text-[var(--color-text)] transition-opacity hover:opacity-70"
            aria-expanded={view === "year"}
          >
            {pickerYear}
            <PickerChevronIcon dir={view === "year" ? "up" : "down"} />
          </button>
        </div>

        {view === "month" ? (
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelect(pickerYear, m)}
                className={[
                  "py-1 text-center text-body-14-m tracking-[-0.04em] transition-colors",
                  pickerYear === year && m === month
                    ? "font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text)] hover:text-[var(--color-text-secondary)]",
                ].join(" ")}
              >
                {m}월
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setPickerYear(y);
                  setView("month");
                }}
                className={[
                  "py-1 text-center text-body-14-m tracking-[-0.04em] transition-colors",
                  y === pickerYear
                    ? "font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text)] hover:text-[var(--color-text-secondary)]",
                ].join(" ")}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 페이지네이션 ──────────────────────────────────────────────────── */
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
    <nav className="flex items-center justify-center gap-2 py-5" aria-label="포인트 내역 페이지 탐색">
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
            "flex h-5 w-5 items-center justify-center text-body-13-r",
            page === p ? "text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]",
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

/* ── 초대링크 행 ────────────────────────────────────────────────────── */
function ReferralLinkRow({
  referralCode,
  desktop = false,
}: {
  referralCode: MyReferralCode | null;
  desktop?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { openAlert } = useModal();

  if (!referralCode) return null;

  function handleCopy() {
    navigator.clipboard.writeText(referralCode!.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      openAlert({
        type: "success",
        title: "초대 링크가 복사되었습니다.",
        description: "공유한 친구가 가입을 완료하면\n포인트가 즉시 지급됩니다.",
      });
    });
  }

  return (
    <div className={["flex items-center gap-3", desktop ? "w-[271px]" : ""].join(" ")}>
      <span className="w-[46px] shrink-0 text-body-13-m leading-4 text-[var(--color-text)]">초대링크</span>
      <div
        className={[
          "flex h-10 items-center gap-3 rounded-[4px] bg-[var(--color-surface-light)] px-3",
          desktop ? "w-[213px] shrink-0" : "min-w-0 flex-1",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={handleCopy}
          aria-label="초대링크 복사"
          className="min-w-0 flex-1 truncate text-left text-body-13-m leading-[18px] text-[var(--color-text)]"
        >
          {referralCode.referralLink}
        </button>
        <button
          type="button"
          aria-label="초대링크 복사"
          onClick={handleCopy}
          className="shrink-0 transition-opacity hover:opacity-70"
        >
          <CopyIcon checked={copied} />
        </button>
      </div>
    </div>
  );
}

/* ── 잔액 카드 ─────────────────────────────────────────────────────── */
interface BalanceCardProps {
  mobile: boolean;
  monthlyEarned: number;
  cumulativePoint: number;
  referralCode: MyReferralCode | null;
  selectedYear: number;
  selectedMonth: number;
  showPicker: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPickerOpen: () => void;
  onPickerClose: () => void;
  onMonthSelect: (year: number, month: number) => void;
}

function MonthBanner({
  selectedMonth,
  showPicker,
  selectedYear,
  bannerPadding,
  onPrevMonth,
  onNextMonth,
  onPickerOpen,
  onPickerClose,
  onMonthSelect,
}: {
  selectedMonth: number;
  showPicker: boolean;
  selectedYear: number;
  bannerPadding: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPickerOpen: () => void;
  onPickerClose: () => void;
  onMonthSelect: (year: number, month: number) => void;
}) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLButtonElement>(null);
  const [tailLeft, setTailLeft] = useState(200);

  useEffect(() => {
    if (!showPicker) return;
    function handlePointerDown(e: PointerEvent) {
      if (bannerRef.current && !bannerRef.current.contains(e.target as Node)) {
        onPickerClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showPicker, onPickerClose]);

  useEffect(() => {
    if (!showPicker || !bannerRef.current || !calendarRef.current) return;
    const bannerRect = bannerRef.current.getBoundingClientRect();
    const calRect = calendarRef.current.getBoundingClientRect();
    const center = calRect.left - bannerRect.left + calRect.width / 2;
    setTailLeft(center - 6);
  }, [showPicker]);

  return (
    <div
      ref={bannerRef}
      className={`relative flex h-9 items-center rounded-t-[20px] bg-[var(--color-cta-button)] ${bannerPadding}`}
    >
      <div ref={navRef} className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="이전 달"
          className="flex h-8 w-8 items-center justify-center text-white transition-opacity hover:opacity-80"
        >
          <ChevronIcon dir="left" />
        </button>
        <span className="min-w-[2.5rem] text-center text-subtitle-16-b tracking-[-0.04em] text-white">
          {selectedMonth}월
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="다음 달"
          className="flex h-8 w-8 items-center justify-center text-white transition-opacity hover:opacity-80"
        >
          <ChevronIcon dir="right" />
        </button>
        <button
          ref={calendarRef}
          type="button"
          onClick={() => (showPicker ? onPickerClose() : onPickerOpen())}
          aria-label="달력 열기"
          aria-expanded={showPicker}
          className="flex h-8 w-8 items-center justify-center text-white transition-opacity hover:opacity-80"
        >
          <CalendarIcon />
        </button>
      </div>
      {showPicker && (
        <YearMonthPicker
          year={selectedYear}
          month={selectedMonth}
          tailLeft={tailLeft}
          onSelect={onMonthSelect}
        />
      )}
    </div>
  );
}

function BalanceCard({
  mobile,
  monthlyEarned,
  cumulativePoint,
  referralCode,
  selectedYear,
  selectedMonth,
  showPicker,
  onPrevMonth,
  onNextMonth,
  onPickerOpen,
  onPickerClose,
  onMonthSelect,
}: BalanceCardProps) {
  const bannerProps = {
    selectedMonth,
    showPicker,
    selectedYear,
    onPrevMonth,
    onNextMonth,
    onPickerOpen,
    onPickerClose,
    onMonthSelect,
  };

  const pointInfo = (
    <div className="flex flex-col gap-1">
      <span className="text-body-14-m leading-[17px] tracking-[-0.04em] text-[var(--color-text-label)]">
        적립 포인트
      </span>
      <div className="flex gap-3">
        <span className="text-[36px] font-bold leading-[43px] tracking-[-0.04em] text-[var(--color-text)]">
          {monthlyEarned.toLocaleString("ko-KR")}P
        </span>
        <span className="mt-[13px] shrink-0 text-body-14-m leading-[17px] tracking-[-0.04em] text-black">
          누적 {cumulativePoint.toLocaleString("ko-KR")}P
        </span>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <div className="overflow-visible rounded-[20px] bg-white">
        <MonthBanner bannerPadding="px-6" {...bannerProps} />
        <div className="rounded-b-[20px] bg-white px-6 pt-6 pb-6">
          <div className="mb-4">{pointInfo}</div>
          <ReferralLinkRow referralCode={referralCode} />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-visible rounded-[20px] bg-white">
      <MonthBanner bannerPadding="pl-8" {...bannerProps} />
      <div className="flex h-[118px] items-center justify-between rounded-b-[20px] bg-white px-12">
        {pointInfo}
        <ReferralLinkRow referralCode={referralCode} desktop />
      </div>
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────────────────── */
interface Props {
  balance: PointBalance;
  items: PointLedgerItem[];
  referralCode: MyReferralCode | null;
}

/* ── 메인 컴포넌트 ─────────────────────────────────────────────────── */
export default function PointHistorySection({ balance, items, referralCode }: Props) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [showPicker, setShowPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [sortTab, setSortTab] = useState<SortTab>("all");

  function handlePrevMonth() {
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (selectedMonth === 12) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }

  function handleMonthSelect(year: number, month: number) {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowPicker(false);
  }

  const monthlyItems = items.filter((item) => {
    const d = new Date(item.createdAt);
    return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
  });

  const monthlyEarned = monthlyItems
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0);

  const cumulativePoint = balance.totalAmount;

  const balanceCardProps = {
    monthlyEarned,
    cumulativePoint,
    referralCode,
    selectedYear,
    selectedMonth,
    showPicker,
    onPrevMonth: handlePrevMonth,
    onNextMonth: handleNextMonth,
    onPickerOpen: () => setShowPicker(true),
    onPickerClose: () => setShowPicker(false),
    onMonthSelect: handleMonthSelect,
  };

  const sortedItems = (() => {
    if (sortTab === "earn") return items.filter((i) => i.amount > 0);
    if (sortTab === "date") return [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return items;
  })();

  const runningBalances = (() => {
    if (sortTab === "date") {
      const totalAmount = items.reduce((s, x) => s + x.amount, 0);
      let running = balance.totalAmount - totalAmount;
      return sortedItems.map((item) => {
        running += item.amount;
        return running;
      });
    }
    return computeRunningBalances(sortedItems, balance.totalAmount);
  })();

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const pageRunning = runningBalances.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const paginationProps = {
    page: currentPage,
    totalPages,
    onPrev: () => { setPage((p) => Math.max(1, p - 1)); },
    onNext: () => { setPage((p) => Math.min(totalPages, p + 1)); },
    onSelect: (p: number) => { setPage(p); },
  };

  function handleTabChange(tab: SortTab) {
    setSortTab(tab);
    setPage(1);
  }

  const SORT_TABS = [
    { id: "all" as const, label: "전체" },
    { id: "earn" as const, label: "적립순" },
    { id: "date" as const, label: "날짜순" },
  ];

  return (
    <div className="min-h-screen bg-white pt-[var(--header-offset)]">

      {/* ━━━━━━━━ 모바일 ━━━━━━━━ */}
      <div className="md:hidden">
        {/* 상단 웜 섹션 — mobile: #FFF9F3(background), px-6, pt-6/pb-6 */}
        <div className="bg-[var(--color-background)] px-6 pb-6 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <Link
              href="/mypage"
              aria-label="마이페이지로 돌아가기"
              className="flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              <BackIcon />
            </Link>
            <h1 className="text-[18px] font-semibold leading-[21px] tracking-[-0.04em] text-[var(--color-text-emphasis)]">MY 포인트</h1>
          </div>
          <BalanceCard mobile {...balanceCardProps} />
        </div>

        {/* 포인트 내역 — pt-6(24px), px-6 */}
        <div className="px-6 pb-12 pt-6">
          <h2 className="mb-6 text-[18px] font-semibold leading-[21px] tracking-[-0.04em] text-[var(--color-text-emphasis)]">포인트 내역</h2>

          {sortedItems.length === 0 ? (
            <p className="py-10 text-center text-body-14-m text-[var(--color-text-label)]">
              포인트 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul>
                {pageItems.map((item, idx) => {
                  const dateRange = fmtDate(item.createdAt);
                  return (
                    <li key={item.id} className="border-b border-[var(--color-text-muted)] py-4 last:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-body-14-m text-[var(--color-text)]">{item.description}</span>
                        <span className="shrink-0 text-body-16-b text-[var(--color-text)]">
                          {fmtPoint(item.amount)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <span className="text-body-14-m text-[var(--color-text-secondary)]">{dateRange}</span>
                        <span className="shrink-0 text-body-14-m text-[var(--color-text-secondary)]">
                          {pageRunning[idx].toLocaleString("ko-KR")}P
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pagination {...paginationProps} />
            </>
          )}
        </div>
      </div>

      {/* ━━━━━━━━ 태블릿·데스크탑 ━━━━━━━━ */}
      <div className="max-md:hidden">
        {/* 상단 웜 섹션 */}
        <div className="bg-[var(--color-support-faq-surface)]">
          <div className="mx-auto max-w-content pb-5 pt-8 md:px-6 lg:px-0">
            <div className="mb-[22px] flex items-center gap-2">
              <Link
                href="/mypage"
                aria-label="마이페이지로 돌아가기"
                className="flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <BackIcon />
              </Link>
              <h1 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">MY 포인트</h1>
            </div>
            <BalanceCard mobile={false} {...balanceCardProps} />
          </div>
        </div>

        {/* 포인트 내역 */}
        <div className="mx-auto max-w-content pb-12 pt-8 md:px-6 lg:px-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">포인트 내역</h2>

            {/* 정렬 탭 */}
            <div className="flex items-center gap-3">
              {SORT_TABS.map((tab, i, arr) => (
                <span key={tab.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={[
                      "transition-colors",
                      sortTab === tab.id
                        ? "text-body-16-b text-[var(--color-text)]"
                        : "text-body-16-m text-[var(--color-text-secondary)] hover:text-[var(--color-text-tertiary)]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                  {i < arr.length - 1 && (
                    <span className="h-[8.5px] w-px bg-[var(--color-text-secondary)]" aria-hidden />
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* 테이블 헤더 */}
          <div className="grid h-11 md:grid-cols-[1fr_120px_130px_110px] lg:grid-cols-[1fr_178px_184px_167px] items-center rounded-lg bg-[var(--color-surface-light)] px-6">
            {["내역", "포인트", "잔여포인트", "적립일"].map((col) => (
              <span key={col} className="text-body-16-m text-[var(--color-text-tertiary)]">{col}</span>
            ))}
          </div>

          {sortedItems.length === 0 ? (
            <p className="py-10 text-center text-body-14-m text-[var(--color-text-label)]">
              포인트 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul>
                {pageItems.map((item, idx) => {
                  return (
                    <li
                      key={item.id}
                      className="grid md:grid-cols-[1fr_120px_130px_110px] lg:grid-cols-[1fr_178px_184px_167px] items-center border-b border-[var(--color-text-muted)] px-6 py-[16px] last:border-b-0"
                    >
                      <span className="text-body-14-m text-[var(--color-text)]">{item.description}</span>
                      <span className="text-body-14-m font-medium text-[var(--color-text)]">
                        {fmtPoint(item.amount)}
                      </span>
                      <span className="text-body-14-m text-[var(--color-text)]">
                        {pageRunning[idx].toLocaleString("ko-KR")}P
                      </span>
                      <span className="text-body-14-m text-[var(--color-text)]">{fmtDate(item.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
              <Pagination {...paginationProps} />
            </>
          )}
        </div>
      </div>

    </div>
  );
}
