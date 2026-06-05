import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { PointBalance, PointHistoryPage, PointHistoryParams } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

export async function fetchPointBalance(token?: string): Promise<PointBalance> {
  return apiClient
    .get<PointBalance>("/v1/points/balance", serverOpts(token))
    .catch(() => ({ balance: 0, expiringWithin30Days: 0 }));
}

export async function fetchPointHistory(
  token?: string,
  params: PointHistoryParams = {},
): Promise<PointHistoryPage> {
  const query = new URLSearchParams();
  if (params.page != null) query.set("page", String(params.page));
  if (params.limit != null) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiClient
    .get<PointHistoryPage>(`/v1/points${qs ? `?${qs}` : ""}`, serverOpts(token))
    .catch(() => ({ items: [], total: 0, page: 1, limit: 20 }));
}
