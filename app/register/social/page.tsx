import { SocialRegisterSection } from "@/widgets/register";
import { getAuthUser } from "@/features/auth/lib/session";
import { SOCIAL_SIGNUP_PENDING_COOKIE_NAME } from "@/features/auth/lib/constants";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = {
  title: "소셜 회원가입 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function SocialRegisterPage() {
  const [user, cookieStore] = await Promise.all([getAuthUser(), cookies()]);

  if (!user) redirect("/login");

  const isPendingSocialSignup =
    cookieStore.get(SOCIAL_SIGNUP_PENDING_COOKIE_NAME)?.value === "1";
  const hasRequiredConsent = user.isAllowTerms && user.isAllowPrivacy;

  if (!isPendingSocialSignup || hasRequiredConsent) redirect("/");

  return <SocialRegisterSection />;
}
