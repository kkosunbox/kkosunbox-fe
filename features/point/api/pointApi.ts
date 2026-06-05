import { apiClient } from "@/shared/lib/api";
import type { PointBalance, PointHistoryPage, PointHistoryParams } from "./types";

/** 포인트 잔액 조회 (30일 내 소멸 예정 포인트 포함) */
export function getPointBalance() {
  return apiClient.get<PointBalance>("/v1/points/balance");
}

/** 포인트 적립/사용 내역 조회 */
export function getPointHistory(params: PointHistoryParams = {}) {
  const query = new URLSearchParams();
  if (params.page != null) query.set("page", String(params.page));
  if (params.limit != null) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiClient.get<PointHistoryPage>(`/v1/points${qs ? `?${qs}` : ""}`);
}
