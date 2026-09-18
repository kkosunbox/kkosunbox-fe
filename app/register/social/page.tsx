import { SocialRegisterSection } from "@/widgets/register";
import { getServerToken } from "@/features/auth/lib/session";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import { redirect } from "next/navigation";

export const metadata = {
  title: "소셜 회원가입 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function SocialRegisterPage() {
  const token = await getServerToken();
  if (!token) redirect("/login");

  return <SocialRegisterSection />;
}
