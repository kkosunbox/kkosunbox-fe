// ── 레퍼럴 코드 ───────────────────────────────────────────────────

export interface MyReferralCode {
  /** 인플루언서인 현재 사용자가 다른 사람에게 공유하는 자신의 레퍼럴 코드 */
  referralCode: string;
  slug: string | null; // 초대 페이지 slug (미설정 시 null)
  referralLink: string | null; // 레퍼럴 링크 (slug 설정 시 /r/{slug}, 미설정 시 null)
}

// ── 인플루언서 초대 페이지 (공개) ─────────────────────────────────

export interface ReferralPageResponse {
  referralCode: string;
  displayName: string;
  profileImageUrl: string | null;
  discountRate: number;
  isActive: boolean;
  /** 인플루언서 전용 랜딩 노출 여부. false면 추천 코드는 유지한 채 홈으로 보낸다. */
  isPageVisible: boolean;
}
