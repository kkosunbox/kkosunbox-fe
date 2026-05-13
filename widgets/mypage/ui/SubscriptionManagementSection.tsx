"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import pawsImg from "../assets/subscription-management-paws.png";
import { TIER_THUMBNAILS } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { Text } from "@/shared/ui";
import type { BillingInfo } from "@/features/billing/api/types";
import type { UserSubscriptionDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
} from "@/widgets/subscribe/plans/ui/packageData";

type SubscriptionFilter = "all" | "active" | "ended";

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

  // 동일 플랜 복수 구독 시 박스 수 합산
  const aggregatedPlans = useMemo(() => {
    const map = new Map<number, { plan: UserSubscriptionDto["plan"]; totalQuantity: number }>();
    for (const s of activeSubscriptions) {
      const entry = map.get(s.plan.id);
      if (entry) {
        entry.totalQuantity += s.quantity || 1;
      } else {
        map.set(s.plan.id, { plan: s.plan, totalQuantity: s.quantity || 1 });
      }
    }
    return [...map.values()];
  }, [activeSubscriptions]);

  return (
    <div className="relative overflow-hidden md:rounded-[20px] md:bg-white max-md:p-5 md:px-8 md:py-6">
      {aggregatedPlans.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {aggregatedPlans.map(({ plan, totalQuantity }) => {
            const theme = packageThemeForPlan(plan);
            return (
              <div key={plan.id} className="inline-flex items-center gap-2">
                <span
                  className="inline-flex h-6 items-center rounded-full px-3 text-body-14-sb leading-[17px] text-white"
                  style={{ background: theme.colorVar }}
                >
                  {theme.tierLabel}
                </span>
                <span
                  className="text-body-14-sb leading-[17px]"
                  style={{ color: theme.colorVar }}
                >
                  {totalQuantity}BOX
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Text as="h3" variant="subtitle-16-b" className="mb-3 text-[var(--color-text)]">
        {count > 0 ? `총 ${count}개의 구독 이용중` : "이용중인 구독이 없습니다"}
      </Text>

      <div className="flex flex-col gap-1.5 text-body-14-m text-[var(--color-text-label)]">
        <p>다음 결제일 : {nextDate ? formatDate(nextDate) : "-"}</p>
        <p>예상 결제 금액 : {totalAmount > 0 ? formatPrice(totalAmount) : "-"}</p>
      </div>

      <img
        src={pawsImg.src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 right-4 h-[72px] w-auto select-none opacity-90 md:bottom-4 md:right-6 md:h-[88px]"
      />
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
    <div className="flex flex-col md:rounded-[20px] md:bg-white max-md:p-5 md:px-8 md:py-6">
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
   Subscription Card (구독 전체보기)
───────────────────────────── */
function SubscriptionRow({
  subscription,
}: {
  subscription: UserSubscriptionDto;
}) {
  const { plan, isActive } = subscription;
  const theme = packageThemeForPlan(plan);
  const badgeColor = isActive ? theme.colorVar : "var(--color-text-tertiary)";

  return (
    <div
      className={`flex items-stretch overflow-hidden md:rounded-[20px] md:bg-white max-md:rounded-[16px] max-md:h-[120px] ${
        isActive
          ? "max-md:bg-[var(--color-support-faq-surface)]"
          : "max-md:bg-[var(--color-surface-light)]"
      }`}
    >
      <div className="relative shrink-0 bg-[var(--color-background)] max-md:h-[120px] max-md:w-[129px] md:min-h-[155px] md:w-[155px]">
        <Image
          src={TIER_THUMBNAILS[theme.tier]}
          alt={`${plan.name} 이미지`}
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col max-md:px-4 max-md:py-[15px] md:p-5">
        <div className="max-md:mb-2 md:mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 max-md:text-[12px] max-md:leading-[14px] max-md:font-semibold md:text-body-14-sb md:leading-[17px] text-white"
              style={{ background: badgeColor }}
            >
              {theme.tierLabel}
            </span>
            <span
              className="max-md:hidden text-body-14-sb leading-[17px]"
              style={{ color: badgeColor }}
            >
              {subscription.quantity || 1}BOX
            </span>
          </div>
          <Link
            href={`/mypage/subscription/detail?subscriptionId=${subscription.id}`}
            className="text-body-13-sb text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
          >
            <span className="md:hidden">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="자세히보기">
                <path d="M7 4l6 6-6 6" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="max-md:hidden">자세히보기</span>
          </Link>
        </div>

        <Text
          variant="subtitle-16-sb"
          mobileVariant="body-14-sb"
          className={`max-md:mb-1 md:mb-1.5 ${isActive ? "text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]"}`}
        >
          <span className="md:hidden">{plan.name}</span>
          <span className="max-md:hidden">{isActive ? `${plan.name} 구독중` : plan.name}</span>
        </Text>

        <Text
          variant="body-14-m"
          mobileVariant="body-13-m"
          className={isActive ? "text-[var(--color-text-label)]" : "text-[var(--color-text-tertiary)]"}
        >
          {isActive ? `${formatDate(subscription.nextBillingDate)} ~` : "-"}
        </Text>
        <Text
          variant="body-14-m"
          mobileVariant="body-13-m"
          className="text-[var(--color-text-label)]"
        >
          {isActive
            ? `결제일 : ${billingDayLabel(subscription.nextBillingDate)}`
            : "구독종료"}
        </Text>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Filter (전체 / 구독중 / 구독종료)
───────────────────────────── */
function SubscriptionFilterTabs({
  value,
  onChange,
}: {
  value: SubscriptionFilter;
  onChange: (next: SubscriptionFilter) => void;
}) {
  const items: { key: SubscriptionFilter; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "active", label: "구독중" },
    { key: "ended", label: "구독종료" },
  ];

  return (
    <div className="flex items-center text-body-14-m">
      {items.map((item, idx) => {
        const selected = value === item.key;
        return (
          <div key={item.key} className="flex items-center">
            <button
              type="button"
              onClick={() => onChange(item.key)}
              className={`px-2 transition-colors ${
                selected
                  ? "text-body-14-sb text-[var(--color-text)]"
                  : "text-[var(--color-text-label)] hover:text-[var(--color-text)]"
              }`}
            >
              {item.label}
            </button>
            {idx < items.length - 1 && (
              <span className="text-[var(--color-text-muted)]">|</span>
            )}
          </div>
        );
      })}
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
      className="flex max-md:h-[120px] max-md:rounded-[16px] max-md:bg-[var(--color-surface-light)] md:h-full md:min-h-[155px] md:rounded-[20px] md:bg-white md:py-10 flex-col items-center justify-center gap-4 transition-opacity hover:opacity-80"
    >
      <Text variant="subtitle-16-sb" mobileVariant="body-13-sb" className="max-md:text-[var(--color-text-tertiary)] md:text-[var(--color-text)]">
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
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<SubscriptionFilter>("active");

  useEffect(() => {
    if (!searchParams.get("welcome")) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState({}, "", url);

    import("canvas-confetti").then(({ default: confetti }) => {
      const shared = {
        particleCount: 45,
        spread: 55,
        startVelocity: 42,
        ticks: 180,
        gravity: 1.3,
        scalar: 0.85,
      } as const;
      confetti({ ...shared, origin: { x: 0.1, y: 0.9 }, angle: 65 });
      confetti({ ...shared, origin: { x: 0.9, y: 0.9 }, angle: 115 });
    });
  // searchParams는 의도적으로 마운트 시 1회만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.isActive),
    [subscriptions],
  );

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return comparePlansForDisplayOrder(a.plan, b.plan);
    });
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    if (filter === "active") return sortedSubscriptions.filter((s) => s.isActive);
    if (filter === "ended") return sortedSubscriptions.filter((s) => !s.isActive);
    return sortedSubscriptions;
  }, [sortedSubscriptions, filter]);

  const showAddCard = filter !== "ended";
  const earliestBillingDate = earliestNextBillingDate(activeSubscriptions);
  const hasPlans = plans.length > 0;

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

          {/* Two summary cards — mobile: single card w/ divider, desktop: two-column grid */}
          <div className="max-md:overflow-hidden max-md:rounded-[20px] max-md:bg-white md:grid md:grid-cols-2 md:gap-5">
            <SubscriptionsSummaryCard activeSubscriptions={activeSubscriptions} />
            <div className="mx-5 border-t border-[var(--color-border-light)] md:hidden" />
            <PaymentInfoCard billingInfo={billingInfo} nextBillingDate={earliestBillingDate} />
          </div>
        </div>
      </div>

      {/* Subscription list — 구독 전체보기 */}
      <div className="mx-auto max-w-content max-md:px-4 md:px-0 py-10">
        <div className="md:rounded-[24px] md:bg-[var(--color-surface-peach)] md:px-8 md:py-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Text as="h2" variant="subtitle-18-b" className="text-[var(--color-text)]">
              구독 전체보기
            </Text>
            <SubscriptionFilterTabs value={filter} onChange={setFilter} />
          </div>

          {!hasPlans ? (
            <p className="text-body-14-m text-[var(--color-text-label)]">
              플랜 정보를 불러올 수 없습니다.
            </p>
          ) : filteredSubscriptions.length === 0 && !showAddCard ? (
            <p className="text-body-14-m text-[var(--color-text-label)]">
              {filter === "ended"
                ? "구독종료된 항목이 없습니다."
                : "구독 내역이 없습니다."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {filteredSubscriptions.map((subscription) => (
                <SubscriptionRow key={subscription.id} subscription={subscription} />
              ))}
              {showAddCard && <AddSubscriptionCard />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
