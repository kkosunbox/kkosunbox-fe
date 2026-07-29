import dynamic from "next/dynamic";
import Link from "next/link";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProductOrders, fetchProducts } from "@/features/product/api/queries";
import { fetchEligiblePlans, fetchMyReviews } from "@/features/review/api/queries";
import { groupOrdersByProduct } from "@/features/product/lib/groupOrdersByProduct";

const PurchaseDetailSection = dynamic(
  () => import("@/widgets/mypage/ui/PurchaseDetailSection"),
);

export const metadata = { title: "구매관리 | 꼬순박스" };

interface PageProps {
  searchParams: Promise<{ productId?: string }>;
}

export default async function PurchaseManagementPage({ searchParams }: PageProps) {
  const { productId } = await searchParams;
  const token = await getServerToken();
  const [orders, products, eligiblePlans, myReviews] = await Promise.all([
    fetchProductOrders(token, { limit: 100 }),
    fetchProducts(token),
    fetchEligiblePlans(token),
    fetchMyReviews(token),
  ]);
  const groups = groupOrdersByProduct(orders, products);

  const targetId = productId ? Number(productId) : null;
  const group = (targetId ? groups.find((g) => g.productId === targetId) : groups[0]) ?? null;

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white pt-[var(--header-offset)] text-center">
        <p className="text-body-14-m text-[var(--color-text-label)]">
          아직 구매하신 상품이 없어요.
        </p>
        <Link
          href="/purchase"
          className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] px-6 text-body-16-sb text-white transition-opacity hover:opacity-90"
        >
          구매하러 가기
        </Link>
      </div>
    );
  }

  const productOrders = orders.filter((order) => order.productId === group.productId);
  const product = products.find((p) => p.id === group.productId) ?? null;

  return (
    <PurchaseDetailSection
      group={group}
      product={product}
      orders={productOrders}
      eligiblePlans={eligiblePlans}
      myReviews={myReviews}
    />
  );
}
