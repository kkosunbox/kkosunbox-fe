"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TIER_THUMBNAILS } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { Text } from "@/shared/ui";
import type { BillingInfo } from "@/features/billing/api/types";
import type { UserSubscriptionDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
} from "@/widgets/subscribe/plans/ui/packageData";

/* ─────────────────────────────
   Icons
───────────────────────────── */
function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="17" stroke="var(--color-icon-gray)" strokeWidth="1.5" fill="none" />
      <path d="M18 11V25M11 18H25" stroke="var(--color-icon-gray)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────
   Props
───────────────────────────── */
interface Props {
  subscriptions: UserSubscriptionDto[];
  plans: SubscriptionPlanDto[];
  billingInfo: BillingInfo | null;
}

/* ─────────────────────────────
   Helpers
───────────────────────────── */
function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, ".");
}

function billingDayLabel(dateStr: string): string {
  const day = parseInt(dateStr.slice(8, 10), 10);
  return `매달 ${day}일`;
}

/* 가장 가까운 다음 결제일 (오름차순 정렬 첫 항목) */
function earliestNextBillingDate(subs: UserSubscriptionDto[]): string | null {
  const dates = subs.map((s) => s.nextBillingDate).filter(Boolean);
  if (dates.length === 0) return null;
  return [...dates].sort()[0];
}

/* ─────────────────────────────
   Subscriptions Summary Card (좌측)
───────────────────────────── */
function SubscriptionsSummaryCard({
  activeSubscriptions,
}: {
  activeSubscriptions: UserSubscriptionDto[];
}) {
  const count = activeSubscriptions.length;
  const nextDate = earliestNextBillingDate(activeSubscriptions);
  const totalAmount = activeSubscriptions.reduce(
    (sum, s) => sum + s.plan.monthlyPrice * (s.quantity || 1),
    0,
  );

  return (
    <div className="rounded-[20px] bg-white max-md:p-5 md:px-8 md:py-6">
      {activeSubscriptions.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeSubscriptions.map((s) => {
            const theme = packageThemeForPlan(s.plan);
            return (
              <span
                key={s.id}
                className="inline-flex h-6 items-center rounded-full px-3 text-body-14-sb leading-[17px] text-white"
                style={{ background: theme.colorVar }}
              >
                {theme.tierLabel}
              </span>
            );
          })}
        </div>
      )}

      <Text as="h3" variant="subtitle-16-b" className="mb-3 text-[var(--color-text)]">
        {count > 0 ? `총 ${count}개의 구독 이용중` : "이용중인 구독이 없습니다"}
      </Text>

      <div className="flex flex-col gap-1.5 text-body-16-m text-[var(--color-text-label)]">
        <p>다음 결제일 : {nextDate ? formatDate(nextDate) : "-"}</p>
        <p>예상 결제 금액 : {totalAmount > 0 ? formatPrice(totalAmount) : "-"}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Payment Info Card (우측)
───────────────────────────── */
function PaymentInfoCard({
  billingInfo: initialBillingInfo,
  nextBillingDate,
}: {
  billingInfo: BillingInfo | null;
  nextBillingDate: string | null;
}) {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(initialBillingInfo);

  useEffect(() => {
    function handlePaymentMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "PAYMENT_SELECTED" && e.data.billing) {
        setBillingInfo(e.data.billing as BillingInfo);
      }
    }
    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, []);

  function handleOpenPayment() {
    window.open(
      `/payment?method=${encodeURIComponent("신용카드")}`,
      "paymentPopup",
      "width=480,height=700,scrollbars=yes",
    );
  }

  const cardDisplay = billingInfo
    ? `${billingInfo.cardCompany} (${billingInfo.lastFourDigits} - **** - **** - ****)`
    : "미등록";
  const methodDisplay = billingInfo ? "신용카드 결제" : "미등록";
  const nextDateDisplay = nextBillingDate ? `${formatDate(nextBillingDate)} (카드결제)` : "-";

  const labelCls = "w-[80px] shrink-0 text-body-14-m text-[var(--color-text-label)]";
  const valueCls = "text-body-14-sb text-[var(--color-text)]";

  return (
    <div className="flex flex-col rounded-[20px] bg-white max-md:p-5 md:px-8 md:py-6">
      <Text as="h3" variant="subtitle-16-b" className="mb-5 text-[var(--color-text)]">
        결제관리
      </Text>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <span className={labelCls}>결제수단</span>
          <span className={valueCls}>{methodDisplay}</span>
        </div>

        <div className="flex items-start gap-3">
          <span className={labelCls}>간편 결제</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className={valueCls}>{cardDisplay}</span>
            <button
              type="button"
              onClick={handleOpenPayment}
              className="inline-flex h-[24px] items-center rounded-[4px] bg-[var(--color-accent)] px-2 text-body-13-m text-white transition-opacity hover:opacity-90"
            >
              결제등록/변경
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={labelCls}>다음 결제일</span>
          <span className={valueCls}>{nextDateDisplay}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Plan Card (구독 전체보기)
───────────────────────────── */
function PlanRow({
  plan,
  subscription,
}: {
  plan: SubscriptionPlanDto;
  subscription: UserSubscriptionDto | null;
}) {
  const theme = packageThemeForPlan(plan);
  const isActive = subscription !== null;
  const badgeColor = isActive ? theme.colorVar : "var(--color-text-tertiary)";

  return (
    <div className="flex items-stretch overflow-hidden rounded-[20px] bg-white">
      <div className="relative h-[140px] w-[140px] shrink-0 bg-[var(--color-background)] md:h-[155px] md:w-[155px]">
        <Image
          src={TIER_THUMBNAILS[theme.tier]}
          alt={`${plan.name} 이미지`}
          fill
          className={`object-cover object-center ${isActive ? "" : "grayscale opacity-70"}`}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
            style={{ background: badgeColor }}
          >
            {theme.tierLabel}
          </span>
          <Link
            href={
              isActive && subscription
                ? `/mypage/subscription/detail?subscriptionId=${subscription.id}`
                : `/subscribe/detail?planId=${plan.id}`
            }
            className="text-body-13-sb text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
          >
            자세히보기
          </Link>
        </div>

        <Text variant="subtitle-16-sb" className="mb-1.5 text-[var(--color-text)]">
          {isActive ? `${plan.name} 구독중` : plan.name}
        </Text>

        <Text variant="body-14-m" className="text-[var(--color-text-label)]">
          {isActive && subscription ? `${formatDate(subscription.nextBillingDate)} ~` : "-"}
        </Text>
        <Text variant="body-14-m" className="text-[var(--color-text-label)]">
          {isActive && subscription
            ? `결제일 : ${billingDayLabel(subscription.nextBillingDate)}`
            : "구독 종료"}
        </Text>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Add Subscription Card (구독 추가하기)
───────────────────────────── */
function AddSubscriptionCard() {
  return (
    <Link
      href="/mypage/subscription/change"
      className="flex h-full min-h-[140px] flex-col items-center justify-center gap-4 rounded-[20px] bg-white py-10 transition-opacity hover:opacity-80 md:min-h-[155px]"
    >
      <Text variant="subtitle-16-sb" className="text-[var(--color-text)]">
        구독 추가하기
      </Text>
      <PlusIcon />
    </Link>
  );
}

/* ─────────────────────────────
   Main Section
───────────────────────────── */
export default function SubscriptionManagementSection({ subscriptions, plans, billingInfo }: Props) {
  const router = useRouter();

  const sortedPlans = useMemo(
    () => [...plans].sort(comparePlansForDisplayOrder),
    [plans],
  );

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.isActive),
    [subscriptions],
  );

  const subscriptionByPlanId = useMemo(() => {
    const map = new Map<number, UserSubscriptionDto>();
    activeSubscriptions.forEach((s) => map.set(s.plan.id, s));
    return map;
  }, [activeSubscriptions]);

  const earliestBillingDate = earliestNextBillingDate(activeSubscriptions);

  return (
    <div className="min-h-screen bg-white">
      {/* Upper band */}
      <div style={{ background: "linear-gradient(268.21deg, rgba(173, 206, 255, 0.5) 3.87%, rgba(254, 234, 215, 0.5) 56.14%)" }}>
        <div className="mx-auto max-w-content max-md:px-4 md:px-0 pb-8 pt-6 md:pt-10">
          {/* Back + title */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1 text-subtitle-20-b text-[var(--color-text)] hover:opacity-70"
          >
            <ChevronLeftIcon />
            구독관리
          </button>

          {/* Two summary cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <SubscriptionsSummaryCard activeSubscriptions={activeSubscriptions} />
            <PaymentInfoCard billingInfo={billingInfo} nextBillingDate={earliestBillingDate} />
          </div>
        </div>
      </div>

      {/* Plans list — 구독 전체보기 */}
      <div className="mx-auto max-w-content max-md:px-4 md:px-0 py-10">
        <div
          className="rounded-[24px] max-md:p-5 md:px-8 md:py-8"
          style={{ background: "var(--color-surface-peach)" }}
        >
          <Text as="h2" variant="subtitle-18-b" className="mb-6 text-[var(--color-text)]">
            구독 전체보기
          </Text>

          {sortedPlans.length === 0 ? (
            <p className="text-body-14-m text-[var(--color-text-label)]">
              플랜 정보를 불러올 수 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {sortedPlans.map((plan) => (
                <PlanRow
                  key={plan.id}
                  plan={plan}
                  subscription={subscriptionByPlanId.get(plan.id) ?? null}
                />
              ))}
              <AddSubscriptionCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
