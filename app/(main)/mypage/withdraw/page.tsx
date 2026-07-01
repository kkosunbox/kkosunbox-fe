import dynamic from "next/dynamic";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";

const WithdrawConfirmSection = dynamic(
  () => import("@/widgets/mypage/ui/WithdrawConfirmSection"),
);

export const metadata = { title: "회원 탈퇴 | 꼬순박스" };

export default async function WithdrawPage() {
  const token = await getServerToken();
  const profile = await fetchProfile(token);

  return <WithdrawConfirmSection profile={profile} />;
}
