"use client";

import type { PointBalance, PointLedgerItem } from "@/features/point/api/types";
import type { MyReferralCode } from "@/features/referral/api";
import { PointHistoryView } from "./point-history/PointHistoryView";
import { usePointHistorySection } from "./point-history/usePointHistorySection";

interface Props {
  balance: PointBalance;
  items: PointLedgerItem[];
  referral: MyReferralCode | null;
}

export default function PointHistorySection({ balance, items, referral }: Props) {
  const vm = usePointHistorySection({ initialBalance: balance, initialItems: items, referral });
  return <PointHistoryView {...vm} />;
}
