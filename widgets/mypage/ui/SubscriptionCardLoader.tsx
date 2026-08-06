import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptions } from "@/features/subscription/api/queries";
import { getSubscriptionDisplayBucket } from "@/features/subscription/lib/subscriptionDisplayBucket";
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
  const active = allSubscriptions.filter(
    (s) => getSubscriptionDisplayBucket(s.status) === "active",
  );
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
