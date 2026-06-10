// ── 포인트 잔액 ────────────────────────────────────────────────────

export interface PointBalance {
  totalAmount: number;   // 전체 누적 포인트
  monthlyAmount: number; // 조회 월 적립 포인트
  year: number;
  month: number;
}

export interface PointBalanceParams {
  year?: number;
  month?: number;
}

// ── 포인트 내역 ────────────────────────────────────────────────────

export type PointLedgerType = "REFERRAL_REWARD";

export interface PointLedgerItem {
  id: number;
  amount: number;
  type: PointLedgerType;
  description: string;
  createdAt: string; // ISO 8601
  referenceId: number | null;
  referralCode: string | null;
}

export interface PointHistoryPage {
  items: PointLedgerItem[];
  total: number;
  page: number;
  limit: number;
}

export interface PointHistoryParams {
  page?: number;
  limit?: number;
  year?: number;
  month?: number;
}
