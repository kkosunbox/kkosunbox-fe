import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptions } from "@/features/subscription/api/queries";
import { fetchEligiblePlans, fetchMyReviews } from "@/features/review/api/queries";
import {
  fetchProductOrders,
  fetchProducts,
  fetchProductOrderPlanSummaries,
} from "@/features/product/api/queries";
import { groupOrdersByProduct } from "@/features/product/lib/groupOrdersByProduct";
import { SubscriptionCard } from "./SubscriptionCard";

export async function SubscriptionCardLoader() {
  const token = await getServerToken();
  const [allSubscriptions, eligiblePlans, myReviews, productOrders, products, productPlanSummaries] =
    await Promise.all([
      fetchSubscriptions(token),
      fetchEligiblePlans(token),
      fetchMyReviews(token),
      fetchProductOrders(token, { limit: 100 }),
      fetchProducts(token),
      fetchProductOrderPlanSummaries(token),
    ]);
  // isActive는 "지금 결제 중인가"만 나타내 scheduled(시작 예약, 첫 결제 전)도 false로 내려온다.
  // 이 캐러셀은 "지금 진행 중인 구독"만 보여주는 요약 카드라 scheduled는 의도적으로 제외하되,
  // 판단 기준은 값이 뭘 의미하는지 분명한 status로 명시한다.
  const active = allSubscriptions.filter((s) => s.status === "active");
  const purchaseGroups = groupOrdersByProduct(productOrders, products);

  return (
    <SubscriptionCard
      subscriptions={active}
      eligiblePlans={eligiblePlans}
      myReviews={myReviews}
      purchaseGroups={purchaseGroups}
      productPlanSummaries={productPlanSummaries}
    />
  );
}
