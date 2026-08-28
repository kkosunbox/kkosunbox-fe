"use client";

import { useEffect, useRef } from "react";
import type { PointBalance, PointLedgerItem } from "@/features/point/api/types";
import type { MyReferralCode } from "@/features/referral/api";
import type { BalanceCardProps } from "./components/BalanceCard";
import { usePointLedgerView } from "./hooks/usePointLedgerView";
import { usePointMonthQuery } from "./hooks/usePointMonthQuery";

type BalanceCardSharedProps = Omit<BalanceCardProps, "mobile">;

/**
 * MY 포인트 Section의 조정자(Coordinator).
 * usePointMonthQuery·usePointLedgerView 조립 + balanceCardProps 구성만 담당한다.
 */
export function usePointHistorySection({
  initialBalance,
  initialItems,
  referral,
}: {
  initialBalance: PointBalance;
  initialItems: PointLedgerItem[];
  /** 내 초대코드·초대링크(`GET /v1/referral/me`) — 조회 실패 시 null, 그대로 화면에 넘긴다 */
  referral: MyReferralCode | null;
}) {
  const ledgerResetRef = useRef<() => void>(() => {});

  const month = usePointMonthQuery({
    initialBalance,
    initialItems,
    onMonthDataLoaded: () => ledgerResetRef.current(),
  });

  const ledger = usePointLedgerView({
    items: month.items,
    totalAmount: month.balance.totalAmount,
  });

  useEffect(() => {
    ledgerResetRef.current = ledger.resetPage;
  }, [ledger.resetPage]);

  const balanceCardProps: BalanceCardSharedProps = {
    monthlyEarned: month.monthlyEarned,
    cumulativePoint: month.cumulativePoint,
    selectedYear: month.selectedYear,
    selectedMonth: month.selectedMonth,
    showPicker: month.showPicker,
    isLoading: month.isBalanceLoading,
    onPrevMonth: month.handlePrevMonth,
    onNextMonth: month.handleNextMonth,
    onPickerOpen: month.onPickerOpen,
    onPickerClose: month.onPickerClose,
    onMonthSelect: month.handleMonthSelect,
  };

  return { balanceCardProps, ledger, referral };
}

export type PointHistorySectionVM = ReturnType<typeof usePointHistorySection>;
