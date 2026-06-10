import { apiClient } from "@/shared/lib/api";
import type { PointBalance, PointBalanceParams, PointHistoryPage, PointHistoryParams } from "./types";

/** 포인트 잔액 조회 (전체 누적 + 특정 월 적립, 미입력 시 현재 년월) */
export function getPointBalance(params: PointBalanceParams = {}) {
  const query = new URLSearchParams();
  if (params.year != null) query.set("year", String(params.year));
  if (params.month != null) query.set("month", String(params.month));
  const qs = query.toString();
  return apiClient.get<PointBalance>(`/v1/points/balance${qs ? `?${qs}` : ""}`);
}

/** 월별 포인트 적립/사용 내역 조회 */
export function getPointHistory(params: PointHistoryParams = {}) {
  const query = new URLSearchParams();
  if (params.page != null) query.set("page", String(params.page));
  if (params.limit != null) query.set("limit", String(params.limit));
  if (params.year != null) query.set("year", String(params.year));
  if (params.month != null) query.set("month", String(params.month));
  const qs = query.toString();
  return apiClient.get<PointHistoryPage>(`/v1/points${qs ? `?${qs}` : ""}`);
}
