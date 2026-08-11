import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getAuthUser, getServerToken } from "@/features/auth/lib/session";
import { fetchPointBalance, fetchPointHistory } from "@/features/point/api/queries";

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
  // (과거 이 자리에 더미 폴백이 있었으나, 실제로 포인트가 0인 사용자에게
  //  존재하지 않는 잔액·적립 내역이 노출되는 문제가 있어 제거했다.)
  const [balance, history] = await Promise.all([
    fetchPointBalance(token),
    fetchPointHistory(token, { limit: 200 }),
  ]);

  return <PointHistorySection balance={balance} items={history.items} />;
}
