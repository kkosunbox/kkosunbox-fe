// ── BillingInfo ───────────────────────────────────────────────────

export interface BillingInfo {
  id: number;
  userId: number;
  lastFourDigits: string;
  cardCompany: string;
  cardType: string;
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
