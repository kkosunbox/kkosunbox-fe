import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser, getServerToken } from "@/features/auth/lib/session";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { fetchSubscriptionPlans, fetchSubscriptions } from "@/features/subscription/api/queries";
import { INVITE_CODE_COOKIE, isValidInviteCode } from "@/features/referral/lib";
import { OrderSection } from "@/widgets/order";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "주문 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; quantity?: string }>;
}) {
  const { planId: planIdStr, quantity: quantityStr } = await searchParams;
  const planId = planIdStr ? Number(planIdStr) : NaN;
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

  const [plans, addresses, billing, subscriptions, cookieStore] = await Promise.all([
    fetchSubscriptionPlans(token),
    fetchDeliveryAddresses(token),
    fetchBillingInfo(token),
    fetchSubscriptions(token),
    cookies(),
  ]);

  const plan = plans.find((p) => p.id === planId);
  if (!plan) {
    redirect("/subscribe");
  }

  // 구독 이력 존재 여부 (취소 건 포함) — 초대코드 섹션 노출/잠금 분기에 사용
  const hasSubscriptionHistory = subscriptions.length > 0;

  // ?ref로 캡처된 초대 코드 (미들웨어가 저장한 쿠키). 형식 검증 후 전달
  const rawInviteCode = cookieStore.get(INVITE_CODE_COOKIE)?.value ?? null;
  const initialInviteCode =
    rawInviteCode && isValidInviteCode(rawInviteCode) ? rawInviteCode : null;

  return (
    <OrderSection
      plan={plan}
      initialAddresses={addresses}
      initialBilling={billing}
      initialQuantity={initialQuantity}
      hasSubscriptionHistory={hasSubscriptionHistory}
      initialInviteCode={initialInviteCode}
    />
  );
}
