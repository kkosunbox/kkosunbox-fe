"use client";

import Link from "next/link";
import { BackIcon } from "./components/icons";
import { BalanceCard } from "./components/BalanceCard";
import { Pagination } from "./components/Pagination";
import { SORT_TABS, fmtDate, fmtPoint } from "./pointHistoryHelpers";
import type { PointHistorySectionVM } from "./usePointHistorySection";

export function PointHistoryView({ balanceCardProps, ledger }: PointHistorySectionVM) {
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
            <h1 className="text-subtitle-18-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]">MY 포인트</h1>
          </div>
          <BalanceCard mobile {...balanceCardProps} />
        </div>

        {/* 포인트 내역 — pt-6(24px), px-6 */}
        <div className="px-6 pb-12 pt-6">
          <h2 className="mb-6 text-subtitle-18-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]">포인트 내역</h2>

          {ledger.sortedItems.length === 0 ? (
            <p className="py-10 text-center text-body-14-m text-[var(--color-text-label)]">
              포인트 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul>
                {ledger.pageItems.map((item, idx) => {
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
                          {ledger.pageRunning[idx].toLocaleString("ko-KR")}P
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pagination {...ledger.paginationProps} />
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
                    onClick={() => ledger.handleTabChange(tab.id)}
                    className={[
                      "transition-colors",
                      ledger.sortTab === tab.id
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

          {ledger.sortedItems.length === 0 ? (
            <p className="py-10 text-center text-body-14-m text-[var(--color-text-label)]">
              포인트 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul>
                {ledger.pageItems.map((item, idx) => {
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
                        {ledger.pageRunning[idx].toLocaleString("ko-KR")}P
                      </span>
                      <span className="text-body-14-m text-[var(--color-text)]">{fmtDate(item.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
              <Pagination {...ledger.paginationProps} />
            </>
          )}
        </div>
      </div>

    </div>
  );
}
