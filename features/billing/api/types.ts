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

// ── 카드 정보 (등록/변경 공통) ────────────────────────────────────

interface CardInfo {
  cardNo: string;    // 16자리 카드번호
  expYear: string;   // 만료 연도 2자리 (예: "25")
  expMonth: string;  // 만료 월 2자리 (예: "12")
  idNo: string;      // 생년월일 6자리 또는 사업자등록번호 10자리
  cardPw: string;    // 카드 비밀번호 앞 2자리
  buyerName?: string;
  buyerEmail?: string;
  buyerTel?: string; // - 없이 숫자만
}

export interface RegisterBillingRequest extends CardInfo {}

export interface UpdateBillingRequest extends CardInfo {
  billingInfoId: number;
}
