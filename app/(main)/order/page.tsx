import { redirect } from "next/navigation";
import { getAuthUser, getServerToken } from "@/features/auth/lib/session";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveOrderReferralContext } from "@/features/referral/lib/resolveReferralContext";
import { ORDER_ENTRY_FROM_PARAM, ORDER_ENTRY_FROM_PURCHASE_PROMO } from "@/features/order";
import { OrderSection } from "@/widgets/order";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "주문 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; quantity?: string; [ORDER_ENTRY_FROM_PARAM]?: string }>;
}) {
  const { planId: planIdStr, quantity: quantityStr, [ORDER_ENTRY_FROM_PARAM]: from } = await searchParams;
  const planId = planIdStr ? Number(planIdStr) : NaN;
  const showStartDateOption = from === ORDER_ENTRY_FROM_PURCHASE_PROMO;
  if (!Number.isFinite(planId) || planId <= 0) {
    redirect("/subscribe");
  }

  // 1~99 범위 외 또는 정수 아님 → 기본값 1로 폴백
  const parsedQuantity = quantityStr ? Number(quantityStr) : 1;
  const initialQuantity =
    Number.isInteger(parsedQuantity) && parsedQuantity >= 1 && parsedQuantity <= 99
      ? parsedQuantity
      : 1;

  // 쿠키 조작·만료 등 어떤 상태에서도 실제 인증을 검증한 뒤 분기
  const [token, authUser] = await Promise.all([getServerToken(), getAuthUser()]);
  if (!authUser) {
    redirect(`/login?next=${encodeURIComponent(`/order?planId=${planId}`)}`);
  }

  const [plans, addresses, billing, referral] = await Promise.all([
    fetchSubscriptionPlans(token),
    fetchDeliveryAddresses(token),
    fetchBillingInfo(token),
    // 초대코드·할인율·적격 여부를 서버에서 한 번에 확정한다. 주문서가 구독 이력을 따로 조회하면
    // 같은 요청에서도 /subscribe와 답이 갈려 쿠폰 적용 전 가격이 어긋난다.
    resolveOrderReferralContext(),
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
      initialQuantity={initialQuantity}
      referral={referral}
      showStartDateOption={showStartDateOption}
    />
  );
}
