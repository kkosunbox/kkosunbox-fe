export type InviteSectionMode = "hidden" | "ineligible" | "locked" | "open";

export interface InviteSectionModeInput {
  /** 초대 링크로 진입해 코드가 확보된 상태인가 (`ReferralContext.isReferral`) */
  hasCapturedInvite: boolean;
  /**
   * 이 계정이 초대코드를 쓸 수 있는가 (= 첫 구독, `ReferralContext.firstSubscriptionEligible`).
   * 서버가 구독 이력을 확인하지 못하면 false로 내려오므로 여기서도 자연히 fail-closed가 된다.
   */
  canUseInviteCode: boolean;
  /** 쿠키 초대코드를 사용자가 삭제한 경우 locked 재진입 방지 */
  inviteDismissed?: boolean;
}

/**
 * 초대코드 섹션 노출 모드 — (초대링크 진입 여부) × (초대코드 사용 가능 여부)로 결정한다.
 * inviteDismissed=true이면 코드가 있어도 locked/ineligible로 가지 않는다.
 *
 * 두 입력 모두 **서버가 확정한 초대 컨텍스트**에서 온다. 주문 페이지가 구독 이력을
 * 따로 조회해 판단하던 것을 걷어냈다 — 그러면 같은 요청에서도 다른 페이지와 답이 갈렸다.
 */
export function getInviteSectionMode({
  hasCapturedInvite,
  canUseInviteCode,
  inviteDismissed = false,
}: InviteSectionModeInput): InviteSectionMode {
  const captured = hasCapturedInvite && !inviteDismissed;
  if (captured) {
    return canUseInviteCode ? "locked" : "ineligible";
  }
  return canUseInviteCode ? "open" : "hidden";
}
