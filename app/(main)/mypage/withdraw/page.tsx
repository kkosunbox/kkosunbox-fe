import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { WithdrawConfirmSection } from "@/widgets/mypage";

export const metadata = { title: "회원 탈퇴 | 꼬순박스" };

export default async function WithdrawPage() {
  const token = await getServerToken();
  const profile = await fetchProfile(token);

  return <WithdrawConfirmSection profile={profile} />;
}
