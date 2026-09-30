import { RegisterSection } from "@/widgets/register";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import { getStoredInviteCodeFromServer } from "@/features/referral/lib/serverInviteCode";

export const metadata = {
  title: "회원가입 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function RegisterPage() {
  const hasStoredReferralCode = Boolean(await getStoredInviteCodeFromServer());
  return <RegisterSection hasStoredReferralCode={hasStoredReferralCode} />;
}
