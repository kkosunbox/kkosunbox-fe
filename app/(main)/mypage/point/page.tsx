import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getAuthUser, getServerToken } from "@/features/auth/lib/session";
import { fetchPointBalance, fetchPointHistory } from "@/features/point/api/queries";
import { fetchMyReferralCode } from "@/features/referral/api/queries";

const PointHistorySection = dynamic(
  () => import("@/widgets/mypage/ui/PointHistorySection"),
);

export const metadata = { title: "MY 포인트 | 꼬순박스" };

export default async function PointPage() {
  const authUser = await getAuthUser();
  if (!authUser?.isInfluencer) {
    redirect("/");
  }

  const token = await getServerToken();

  // 잔액 0·내역 없음은 정상 상태 그대로 보여준다.
  // 실제 포인트 내역이 없을 때는 빈 상태 UI를 렌더링한다.
  const [balance, history, referral] = await Promise.all([
    fetchPointBalance(token),
    fetchPointHistory(token, { limit: 200 }),
    fetchMyReferralCode(token),
  ]);

  return <PointHistorySection balance={balance} items={history.items} referral={referral} />;
}
