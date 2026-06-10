import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { PointBalance, PointBalanceParams, PointHistoryPage, PointHistoryParams } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

export async function fetchPointBalance(token?: string, params: PointBalanceParams = {}): Promise<PointBalance> {
  const query = new URLSearchParams();
  if (params.year != null) query.set("year", String(params.year));
  if (params.month != null) query.set("month", String(params.month));
  const qs = query.toString();
  const now = new Date();
  return apiClient
    .get<PointBalance>(`/v1/points/balance${qs ? `?${qs}` : ""}`, serverOpts(token))
    .catch(() => ({ totalAmount: 0, monthlyAmount: 0, year: now.getFullYear(), month: now.getMonth() + 1 }));
}

export async function fetchPointHistory(
  token?: string,
  params: PointHistoryParams = {},
): Promise<PointHistoryPage> {
  const query = new URLSearchParams();
  if (params.page != null) query.set("page", String(params.page));
  if (params.limit != null) query.set("limit", String(params.limit));
  if (params.year != null) query.set("year", String(params.year));
  if (params.month != null) query.set("month", String(params.month));
  const qs = query.toString();
  return apiClient
    .get<PointHistoryPage>(`/v1/points${qs ? `?${qs}` : ""}`, serverOpts(token))
    .catch(() => ({ items: [], total: 0, page: 1, limit: 20 }));
}
