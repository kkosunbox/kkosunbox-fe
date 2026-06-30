"use client";

import { useState } from "react";
import { getPointBalance, getPointHistory } from "@/features/point/api";
import type { PointBalance, PointLedgerItem } from "@/features/point/api/types";
import { getErrorMessage } from "@/shared/lib/api";
import { useModal } from "@/shared/ui";
import { getNextMonth, getPrevMonth } from "../pointHistoryHelpers";

/**
 * 포인트 잔액·내역의 월 단위 fetch 및 월 네비게이션·picker 상태를 소유한다.
 * 월 전환 시 `onMonthDataLoaded`로 리스트 페이지 등 하위 상태 리셋을 위임한다.
 */
export function usePointMonthQuery({
  initialBalance,
  initialItems,
  onMonthDataLoaded,
}: {
  initialBalance: PointBalance;
  initialItems: PointLedgerItem[];
  onMonthDataLoaded?: () => void;
}) {
  const { openAlert } = useModal();
  const [balance, setBalance] = useState(initialBalance);
  const [items, setItems] = useState(initialItems);
  const [selectedYear, setSelectedYear] = useState(initialBalance.year);
  const [selectedMonth, setSelectedMonth] = useState(initialBalance.month);
  const [showPicker, setShowPicker] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  async function loadMonthData(year: number, month: number) {
    setIsBalanceLoading(true);
    try {
      const [newBalance, newHistory] = await Promise.all([
        getPointBalance({ year, month }),
        getPointHistory({ year, month, limit: 200 }),
      ]);
      setBalance(newBalance);
      setItems(newHistory.items);
      setSelectedYear(newBalance.year);
      setSelectedMonth(newBalance.month);
      onMonthDataLoaded?.();
    } catch (err) {
      openAlert({ title: getErrorMessage(err, "포인트 정보를 불러오지 못했습니다.") });
    } finally {
      setIsBalanceLoading(false);
    }
  }

  function handlePrevMonth() {
    const { year, month } = getPrevMonth(selectedYear, selectedMonth);
    void loadMonthData(year, month);
  }

  function handleNextMonth() {
    const { year, month } = getNextMonth(selectedYear, selectedMonth);
    void loadMonthData(year, month);
  }

  function handleMonthSelect(year: number, month: number) {
    setShowPicker(false);
    void loadMonthData(year, month);
  }

  return {
    balance,
    items,
    selectedYear,
    selectedMonth,
    showPicker,
    isBalanceLoading,
    monthlyEarned: balance.monthlyAmount,
    cumulativePoint: balance.totalAmount,
    handlePrevMonth,
    handleNextMonth,
    handleMonthSelect,
    onPickerOpen: () => setShowPicker(true),
    onPickerClose: () => setShowPicker(false),
  };
}
