import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import {
  fetchSubscriptions,
  fetchSubscriptionPaymentHistory,
} from "@/features/subscription/api/queries";
import type { SubscriptionPaymentDto } from "@/features/subscription/api/types";
import { SubscriptionCard } from "./SubscriptionCard";

function deriveStartDate(payments: SubscriptionPaymentDto[]): string | undefined {
  const dates = payments
    .filter((p) => p.status === "completed" && (p.approvedAt ?? p.createdAt))
    .map((p) => (p.approvedAt ?? p.createdAt!).slice(0, 10))
    .sort();
  return dates[0];
}

export async function SubscriptionCardLoader() {
  const token = await getServerToken();
  const allSubscriptions = await fetchSubscriptions(token);
  const active = allSubscriptions.filter((s) => s.isActive);

  // 활성 구독별 결제 이력에서 시작일 병렬 추출
  const withStartDate = await Promise.all(
    active.map(async (s) => {
      const payments = await fetchSubscriptionPaymentHistory(s.id, token).catch(() => []);
      return { ...s, startDate: deriveStartDate(payments) };
    }),
  );

  return <SubscriptionCard subscriptions={withStartDate} />;
}
