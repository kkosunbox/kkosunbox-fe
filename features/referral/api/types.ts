// ── 레퍼럴 코드 ───────────────────────────────────────────────────

export interface MyReferralCode {
  referralCode: string;
  slug: string | null;       // 초대 페이지 slug (미설정 시 null)
  referralLink: string | null; // 레퍼럴 링크 (slug 설정 시 /ref/{slug}, 미설정 시 null)
}

// ── 인플루언서 초대 페이지 (공개) ─────────────────────────────────

export interface ReferralPageResponse {
  referralCode: string;
  displayName: string;
  profileImageUrl: string | null;
  discountRate: number;
  isActive: boolean;
}

// ── 초대 코드 적용 가능 여부 ──────────────────────────────────────

export interface ReferralValidation {
  isApplicable: boolean; // 레퍼럴 코드 적용 가능 여부. false면 구독 생성 시 코드가 무시됨
  discountRate: number; // 적용될 할인율 (0.1 = 10%). isApplicable=false이거나 첫 구독이 아니면 0
}
