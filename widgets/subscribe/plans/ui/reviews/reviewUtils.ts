// 리뷰 카드용 순수 유틸. SubscribeProductDetailPage에서 분리.

// 리뷰 프로필 이미지가 없을 때 표시하는 폴백 아바타 배경색.
// CSS 토큰(--color-avatar-1~6)을 사용해 CLAUDE.md 색상 규칙을 준수한다.
const AVATAR_COLOR_VARS = [
  "var(--color-avatar-1)",
  "var(--color-avatar-2)",
  "var(--color-avatar-3)",
  "var(--color-avatar-4)",
  "var(--color-avatar-5)",
  "var(--color-avatar-6)",
];

export function getAvatarColor(seed: string | number | null): string {
  if (seed === null) return AVATAR_COLOR_VARS[0];
  const n = typeof seed === "number" ? seed : seed.charCodeAt(0);
  return AVATAR_COLOR_VARS[Math.abs(n) % AVATAR_COLOR_VARS.length];
}

export function maskEmail(email: string | null): string {
  if (!email) return "";
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return email;
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 2) return `${local[0]}**${domain}`;
  return `${local.slice(0, 2)}****${domain}`;
}

export function formatReviewDate(isoDate: string): string {
  return isoDate.slice(0, 10).replace(/-/g, ".");
}
