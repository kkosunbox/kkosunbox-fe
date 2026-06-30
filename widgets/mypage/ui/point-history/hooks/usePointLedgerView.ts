"use client";

import { useCallback, useState } from "react";
import type { PointLedgerItem } from "@/features/point/api/types";
import {
  ITEMS_PER_PAGE,
  computeLedgerRunningBalances,
  sortLedgerItems,
  type SortTab,
} from "../pointHistoryHelpers";

/**
 * 포인트 내역 리스트의 정렬·페이지네이션·잔여포인트 파생 상태를 소유한다.
 * `items`·`totalAmount`는 usePointMonthQuery가 공급한다.
 */
export function usePointLedgerView({
  items,
  totalAmount,
}: {
  items: PointLedgerItem[];
  totalAmount: number;
}) {
  const [page, setPage] = useState(1);
  const [sortTab, setSortTab] = useState<SortTab>("all");

  const sortedItems = sortLedgerItems(items, sortTab);
  const runningBalances = computeLedgerRunningBalances(
    sortedItems,
    sortTab,
    items,
    totalAmount,
  );

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

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    sortTab,
    sortedItems,
    pageItems,
    pageRunning,
    paginationProps,
    handleTabChange,
    resetPage,
  };
}
