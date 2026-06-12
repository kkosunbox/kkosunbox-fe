// ── 레퍼럴 코드 ───────────────────────────────────────────────────

export interface MyReferralCode {
  referralCode: string; // 나의 레퍼럴 코드
  referralLink: string; // 클라이언트가 공유에 사용할 링크
}

// ── 초대 코드 적용 가능 여부 ──────────────────────────────────────

export interface ReferralValidation {
  isApplicable: boolean; // 레퍼럴 코드 적용 가능 여부. false면 구독 생성 시 코드가 무시됨
  discountRate: number; // 적용될 할인율 (0.1 = 10%). isApplicable=false이거나 첫 구독이 아니면 0
}
