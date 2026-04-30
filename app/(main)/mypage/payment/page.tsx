import { getServerToken } from "@/features/auth/lib/session";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchActiveSubscription, fetchPaymentHistory } from "@/features/subscription/api/queries";
import { PaymentManagementSection } from "@/widgets/mypage";
import type { BillingInfo } from "@/features/billing/api/types";
import type { UserSubscriptionDto, SubscriptionPaymentDto } from "@/features/subscription/api/types";

export const metadata = { title: "결제관리 | 꼬순박스" };

/* ── dev 전용 테스트 데이터 ─────────────────────────────────────── */

const DEV_BILLING: BillingInfo = {
  id: 1,
  userId: 1,
  lastFourDigits: "1234",
  cardCompany: "국민카드",
  cardType: "credit",
  ownerType: "personal",
  authenticatedAt: "2026-01-01T00:00:00.000Z",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const DEV_SUBSCRIPTION: UserSubscriptionDto = {
  id: 1,
  userId: 1,
  petProfileId: 1,
  deliveryAddressId: 1,
  plan: { id: 3, name: "프리미엄 패키지", monthlyPrice: 25000, sortOrder: 3, isRecommended: true },
  quantity: 1,
  status: "active",
  nextBillingDate: "2026-04-21",
  isActive: true,
};

const DEV_PAYMENTS: SubscriptionPaymentDto[] = [
  { id: 10, subscriptionId: 1, status: "pending",   amount: 25000, baseAmount: 22727, taxAmount: 2273, createdAt: "2026-04-21T00:00:00.000Z", planName: "프리미엄 패키지" },
  { id: 9,  subscriptionId: 1, status: "completed", amount: 25000, baseAmount: 22727, taxAmount: 2273, createdAt: "2026-03-21T09:00:00.000Z", approvedAt: "2026-03-21T09:00:00.000Z", planName: "프리미엄 패키지" },
  { id: 8,  subscriptionId: 1, status: "completed", amount: 25000, baseAmount: 22727, taxAmount: 2273, createdAt: "2026-02-21T09:00:00.000Z", approvedAt: "2026-02-21T09:00:00.000Z", planName: "프리미엄 패키지" },
  { id: 7,  subscriptionId: 1, status: "completed", amount: 25000, baseAmount: 22727, taxAmount: 2273, createdAt: "2026-01-21T09:00:00.000Z", approvedAt: "2026-01-21T09:00:00.000Z", planName: "프리미엄 패키지" },
  { id: 6,  subscriptionId: 1, status: "completed", amount: 20000, baseAmount: 18182, taxAmount: 1818, createdAt: "2025-12-21T09:00:00.000Z", approvedAt: "2025-12-21T09:00:00.000Z", planName: "프리미엄 패키지" },
  { id: 5,  subscriptionId: 1, status: "completed", amount: 20000, baseAmount: 18182, taxAmount: 1818, createdAt: "2025-11-21T09:00:00.000Z", approvedAt: "2025-11-21T09:00:00.000Z", planName: "스탠다드 패키지" },
  { id: 4,  subscriptionId: 1, status: "completed", amount: 20000, baseAmount: 18182, taxAmount: 1818, createdAt: "2025-10-21T09:00:00.000Z", approvedAt: "2025-10-21T09:00:00.000Z", planName: "스탠다드 패키지" },
  { id: 3,  subscriptionId: 1, status: "completed", amount: 20000, baseAmount: 18182, taxAmount: 1818, createdAt: "2025-10-21T09:00:00.000Z", approvedAt: "2025-10-21T09:00:00.000Z", planName: "스탠다드 패키지" },
  { id: 2,  subscriptionId: 1, status: "completed", amount: 20000, baseAmount: 18182, taxAmount: 1818, createdAt: "2025-10-21T09:00:00.000Z", approvedAt: "2025-10-21T09:00:00.000Z", planName: "스탠다드 패키지" },
  { id: 1,  subscriptionId: 1, status: "completed", amount: 20000, baseAmount: 18182, taxAmount: 1818, createdAt: "2025-10-21T09:00:00.000Z", approvedAt: "2025-10-21T09:00:00.000Z", planName: "스탠다드 패키지" },
];

/* ─────────────────────────────────────────────────────────────── */

export default async function PaymentPage() {
  const token = await getServerToken();

  const [billingInfo, subscription, payments] = await Promise.all([
    fetchBillingInfo(token),
    fetchActiveSubscription(token),
    fetchPaymentHistory(token),
  ]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <PaymentManagementSection
      billingInfo={billingInfo ?? (isDev ? DEV_BILLING : null)}
      subscription={subscription ?? (isDev ? DEV_SUBSCRIPTION : null)}
      payments={payments.length > 0 ? payments : isDev ? DEV_PAYMENTS : []}
    />
  );
}
