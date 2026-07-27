// ── BillingInfo ───────────────────────────────────────────────────

// 카드사명·끝 4자리는 백엔드에서 null로 내려오는 경우가 확인됨 → 표시할 땐
// features/billing/lib/formatBillingLabel의 헬퍼를 거친다(화면에 "null" 노출 방지).
export interface BillingInfo {
  id: number;
  userId: number;
  lastFourDigits: string | null;
  cardCompany: string | null;
  /** "신용" | "체크" | "기프트" 등. 카드사명이 없을 때 표시 라벨로 사용한다. */
  cardType: string | null;
  ownerType: string;
  authenticatedAt: string;
  isActive: boolean;
  createdAt: string;
}

// ── 약관 ──────────────────────────────────────────────────────────

export type BillingTermsType =
  | "ElectronicFinancialTransactions" // 전자금융거래 약관
  | "CollectPersonalInfo"             // 개인정보 수집 및 이용 약관
  | "SharingPersonalInformation";     // 개인정보 제3자 제공약관

export interface BillingTermsResponse {
  termsTitle: string;
  content: string;
}

// ── Toss 자동결제(빌링) 등록/변경 공통 ──────────────────────────
// authKey: Toss 카드 등록 인증 완료 후 successUrl로 전달받는 값.
// customerKey: SDK requestBillingAuth 호출 시 사용한 값과 동일해야 함.

export interface RegisterBillingRequest {
  authKey: string;
  customerKey: string;
}

export interface UpdateBillingRequest extends RegisterBillingRequest {
  billingInfoId: number;
}
