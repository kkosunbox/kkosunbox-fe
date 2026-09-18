import type { AuthUser } from "../model/types";

/** 소셜 가입 후 필수 약관 동의와 연락처 입력이 남아 있는지 판정한다. */
export function requiresSignupCompletion(
  user: Pick<AuthUser, "phone" | "isAllowTerms" | "isAllowPrivacy">,
): boolean {
  return !user.phone || !user.isAllowTerms || !user.isAllowPrivacy;
}
