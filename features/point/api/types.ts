// ── 포인트 잔액 ────────────────────────────────────────────────────

export interface PointBalance {
  balance: number;              // 유효 포인트 잔액 (만료되지 않은 포인트 합산)
  expiringWithin30Days: number; // 30일 이내 소멸 예정 포인트
}

// ── 포인트 내역 ────────────────────────────────────────────────────

export type PointLedgerType = "REFERRAL_REWARD";

export interface PointLedgerItem {
  id: number;
  amount: number;       // 포인트 금액 (양수: 적립)
  type: PointLedgerType;
  description: string;
  createdAt: string;    // ISO 8601
  expiresAt: string | null;
  referenceId: number | null;  // 관련 결제 ID
  referralCode: string | null; // 사용된 레퍼럴 코드
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
}
