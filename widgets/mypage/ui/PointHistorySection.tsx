"use client";

import type { PointBalance, PointLedgerItem } from "@/features/point/api/types";
import { PointHistoryView } from "./point-history/PointHistoryView";
import { usePointHistorySection } from "./point-history/usePointHistorySection";

interface Props {
  balance: PointBalance;
  items: PointLedgerItem[];
}

export default function PointHistorySection({ balance, items }: Props) {
  const vm = usePointHistorySection({ initialBalance: balance, initialItems: items });
  return <PointHistoryView {...vm} />;
}
