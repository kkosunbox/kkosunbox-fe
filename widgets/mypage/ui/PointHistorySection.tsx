"use client";

import { useState } from "react";
import Link from "next/link";
import type { PointBalance, PointLedgerItem } from "@/features/point/api/types";
import type { MyReferralCode } from "@/features/referral/api/types";

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
function ReferralLinkRow({ referralCode }: { referralCode: MyReferralCode | null }) {
  const [copied, setCopied] = useState(false);

  if (!referralCode) return null;

  function handleCopy() {
    navigator.clipboard.writeText(referralCode!.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-body-13-m text-[var(--color-text)]">초대링크</span>
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded bg-[var(--color-surface-light)] px-3 h-10">
        <span className="min-w-0 flex-1 truncate text-body-13-m text-[var(--color-text)]">
          {referralCode.referralLink}
        </span>
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
  balanceValue: number;
  expiringText: string;
  referralCode: MyReferralCode | null;
}

function BalanceCard({ mobile, balanceValue, expiringText, referralCode }: BalanceCardProps) {
  if (mobile) {
    return (
      <div className="overflow-hidden rounded-[20px]">
        {/* 오렌지 배너 — h-9(36px), px-6(24px) */}
        <div className="flex h-9 items-center bg-[var(--color-cta-button)] px-6">
          <span className="text-subtitle-16-b tracking-[-0.04em] text-white">보유 포인트</span>
        </div>
        {/* 흰색 콘텐츠 — pt/pb-6(24px), gap mb-4(16px) */}
        <div className="bg-white px-6 pt-6 pb-6">
          <div className="mb-4 flex items-center gap-4">
            <span className="text-[36px] font-bold leading-[43px] tracking-[-0.04em] text-[var(--color-text)]">
              {balanceValue.toLocaleString("ko-KR")}P
            </span>
            <span className="text-body-14-m tracking-[-0.04em] text-[var(--color-text-label)]">
              {expiringText}
            </span>
          </div>
          <ReferralLinkRow referralCode={referralCode} />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px]">
      {/* 오렌지 배너 — h-9(36px), px-12(48px) */}
      <div className="flex h-9 items-center bg-[var(--color-cta-button)] px-12">
        <span className="text-subtitle-16-b tracking-[-0.04em] text-white">보유 포인트</span>
      </div>

      {/* 흰색 콘텐츠 — h-[118px](카드154-배너36), px-12(48px), 수직 중앙 정렬 */}
      <div className="flex h-[118px] items-center justify-between bg-white px-12">
        <div className="flex items-center gap-5">
          <span className="text-[36px] font-bold leading-[43px] tracking-[-0.04em] text-[var(--color-text)]">
            {balanceValue.toLocaleString("ko-KR")}P
          </span>
          <span className="text-body-14-m tracking-[-0.04em] text-[var(--color-text-label)]">
            {expiringText}
          </span>
        </div>
        {/* 초대링크 섹션 — w-[271px](46px label + 12px gap + 213px frame) */}
        <div className="w-[271px] shrink-0">
          <ReferralLinkRow referralCode={referralCode} />
        </div>
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
  const [page, setPage] = useState(1);
  const [sortTab, setSortTab] = useState<SortTab>("all");

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
      let running = balance.balance - totalAmount;
      return sortedItems.map((item) => {
        running += item.amount;
        return running;
      });
    }
    return computeRunningBalances(sortedItems, balance.balance);
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

  const expiringText = `소멸예정 ${balance.expiringWithin30Days.toLocaleString("ko-KR")}P`;

  const SORT_TABS = [
    { id: "all" as const, label: "전체" },
    { id: "earn" as const, label: "적립순" },
    { id: "date" as const, label: "날짜순" },
  ];

  return (
    <div className="min-h-screen bg-white pt-[54px]">

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
          <BalanceCard
            mobile
            balanceValue={balance.balance}
            expiringText={expiringText}
            referralCode={referralCode}
          />
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
                  const dateRange = item.expiresAt
                    ? `${fmtDate(item.createdAt)} ~ ${fmtDate(item.expiresAt)}`
                    : fmtDate(item.createdAt);
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
            <BalanceCard
              mobile={false}
              balanceValue={balance.balance}
              expiringText={expiringText}
              referralCode={referralCode}
            />
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
          <div className="grid h-11 md:grid-cols-[1fr_120px_130px_110px_110px] lg:grid-cols-[1fr_178px_184px_167px_178px] items-center rounded-lg bg-[var(--color-surface-light)] px-6">
            {["내역", "포인트", "잔여포인트", "적립일", "사용기한"].map((col) => (
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
                      className="grid md:grid-cols-[1fr_120px_130px_110px_110px] lg:grid-cols-[1fr_178px_184px_167px_178px] items-center border-b border-[var(--color-text-muted)] px-6 py-[16px] last:border-b-0"
                    >
                      <span className="text-body-14-m text-[var(--color-text)]">{item.description}</span>
                      <span className="text-body-14-m font-medium text-[var(--color-text)]">
                        {fmtPoint(item.amount)}
                      </span>
                      <span className="text-body-14-m text-[var(--color-text)]">
                        {pageRunning[idx].toLocaleString("ko-KR")}P
                      </span>
                      <span className="text-body-14-m text-[var(--color-text)]">{fmtDate(item.createdAt)}</span>
                      <span className="text-body-14-m text-[var(--color-text)]">{fmtDate(item.expiresAt)}</span>
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
