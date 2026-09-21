import { SocialRegisterSection } from "@/widgets/register";
import { getAuthUser } from "@/features/auth/lib/session";
import { requiresSignupCompletion } from "@/features/auth";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import { redirect } from "next/navigation";

export const metadata = {
  title: "소셜 회원가입 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function SocialRegisterPage() {
  const user = await getAuthUser();

  if (!user) redirect("/login");
  if (!requiresSignupCompletion(user)) redirect("/");

  return <SocialRegisterSection />;
}
