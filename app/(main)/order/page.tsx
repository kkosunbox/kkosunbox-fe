import { redirect } from "next/navigation";
import { getAuthUser, getServerToken } from "@/features/auth/lib/session";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { fetchProfiles } from "@/features/profile/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { OrderSection } from "@/widgets/order";

export const metadata = {
  title: "주문 | 꼬순박스",
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId: planIdStr } = await searchParams;
  const planId = planIdStr ? Number(planIdStr) : NaN;
  if (!Number.isFinite(planId) || planId <= 0) {
    redirect("/subscribe");
  }

  // 쿠키 조작·만료 등 어떤 상태에서도 실제 인증을 검증한 뒤 분기
  const [token, authUser] = await Promise.all([getServerToken(), getAuthUser()]);
  if (!authUser) {
    redirect(`/login?next=${encodeURIComponent(`/order?planId=${planId}`)}`);
  }

  // 여기서 profiles === [] 이면 인증된 유저가 프로필을 아직 만들지 않은 경우
  const profiles = await fetchProfiles(token);
  if (profiles.length === 0) {
    redirect("/mypage/profile");
  }

  const [plans, addresses, billing] = await Promise.all([
    fetchSubscriptionPlans(token, profiles[0]!.id),
    fetchDeliveryAddresses(token),
    fetchBillingInfo(token),
  ]);

  const plan = plans.find((p) => p.id === planId);
  if (!plan) {
    redirect("/subscribe");
  }

  return (
    <OrderSection
      plan={plan}
      initialAddresses={addresses}
      initialBilling={billing}
    />
  );
}
