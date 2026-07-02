import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getAuthUser, getServerToken } from "@/features/auth/lib/session";
import { fetchPointBalance, fetchPointHistory } from "@/features/point/api/queries";
import type { PointLedgerItem } from "@/features/point/api/types";

const PointHistorySection = dynamic(
  () => import("@/widgets/mypage/ui/PointHistorySection"),
);

export const metadata = { title: "MY 포인트 | 꼬순박스" };

// TODO: API 연동 완료 시 제거
const DUMMY_ITEMS: PointLedgerItem[] = [
  {
    id: 1,
    amount: -5000,
    type: "REFERRAL_REWARD",
    description: "포인트 사용",
    createdAt: "2026-04-21T00:00:00Z",
    referenceId: 1001,
    referralCode: null,
  },
  {
    id: 2,
    amount: 1000,
    type: "REFERRAL_REWARD",
    description: "친구추가 적립",
    createdAt: "2026-03-21T00:00:00Z",
    referenceId: null,
    referralCode: "ABC123",
  },
  {
    id: 3,
    amount: 1000,
    type: "REFERRAL_REWARD",
    description: "친구추가 적립",
    createdAt: "2026-02-21T00:00:00Z",
    referenceId: null,
    referralCode: "DEF456",
  },
  {
    id: 4,
    amount: 1000,
    type: "REFERRAL_REWARD",
    description: "친구추가 적립",
    createdAt: "2026-01-21T00:00:00Z",
    referenceId: null,
    referralCode: "GHI789",
  },
  {
    id: 5,
    amount: -2000,
    type: "REFERRAL_REWARD",
    description: "포인트 사용",
    createdAt: "2025-12-21T00:00:00Z",
    referenceId: 1002,
    referralCode: null,
  },
];

// TODO: API 연동 완료 시 제거
const DUMMY_BALANCE = { totalAmount: 2270, monthlyAmount: 800, year: 2026, month: 6 };

export default async function PointPage() {
  const authUser = await getAuthUser();
  if (!authUser?.isInfluencer) {
    redirect("/");
  }

  const token = await getServerToken();

  const [balance, history] = await Promise.all([
    fetchPointBalance(token),
    fetchPointHistory(token, { limit: 200 }),
  ]);

  const displayBalance = balance.totalAmount === 0 ? DUMMY_BALANCE : balance;
  const displayItems = history.items.length === 0 ? DUMMY_ITEMS : history.items;

  return (
    <PointHistorySection
      balance={displayBalance}
      items={displayItems}
    />
  );
}
