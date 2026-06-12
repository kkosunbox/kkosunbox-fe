export type InviteSectionMode = "hidden" | "ineligible" | "locked" | "open";

export interface InviteSectionModeInput {
  initialInviteCode: string | null;
  hasSubscriptionHistory: boolean;
  /** 쿠키 초대코드를 사용자가 삭제한 경우 locked 재진입 방지 */
  inviteDismissed?: boolean;
}

/**
 * 초대코드 섹션 노출 모드 — (초대링크 진입 여부) × (구독 이력 여부)로 결정한다.
 * inviteDismissed=true이면 쿠키가 있어도 locked/ineligible로 가지 않는다.
 */
export function getInviteSectionMode({
  initialInviteCode,
  hasSubscriptionHistory,
  inviteDismissed = false,
}: InviteSectionModeInput): InviteSectionMode {
  const hasCapturedInvite = Boolean(initialInviteCode) && !inviteDismissed;
  if (hasCapturedInvite) {
    return hasSubscriptionHistory ? "ineligible" : "locked";
  }
  return hasSubscriptionHistory ? "hidden" : "open";
}
