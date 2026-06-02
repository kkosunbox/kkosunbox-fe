"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import pawsImg from "../assets/subscription-management-paws.png";
import { TIER_BOX_IMAGES } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { Text } from "@/shared/ui";
import type { BillingInfo } from "@/features/billing/api/types";
import type { UserSubscriptionDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
} from "@/widgets/subscribe/plans/ui/packageData";
import { PAYMENT_REGISTER_CHIP_BUTTON_CLASS } from "./dashboard-shared";

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

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
    <div className="relative overflow-hidden max-md:p-5 md:flex-1 lg:flex-1 md:px-8 lg:px-8 md:py-8 lg:py-8">
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
                {totalQuantity > 1 && (
                  <span
                    className="text-body-14-sb leading-[17px]"
                    style={{ color: theme.colorVar }}
                  >
                    {totalQuantity}BOX
                  </span>
                )}
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
        className="pointer-events-none absolute bottom-3 right-4 h-[72px] w-auto select-none opacity-90 md:bottom-4 lg:bottom-4 md:right-6 lg:right-6 md:h-[88px] lg:h-[88px]"
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
    ? `${billingInfo.cardCompany} (${billingInfo.lastFourDigits})`
    : "미등록";
  const methodDisplay = billingInfo ? "신용카드 결제" : "미등록";
  const nextDateDisplay = nextBillingDate ? `${formatDate(nextBillingDate)} (카드결제)` : "-";

  const labelCls = "w-[80px] shrink-0 text-body-14-m text-[var(--color-text-label)]";
  const valueCls = "text-body-14-sb text-[var(--color-text)]";

  return (
    <div className="flex flex-col max-md:p-5 md:flex-1 lg:flex-1 md:px-8 lg:px-8 md:py-8 lg:py-8">
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
              className={PAYMENT_REGISTER_CHIP_BUTTON_CLASS}
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
  const { plan, isActive, isPaused } = subscription;
  const theme = packageThemeForPlan(plan);
  const boxQuantity = subscription.quantity || 1;
  const badgeColor = isActive ? theme.colorVar : "var(--color-text-secondary)";

  return (
    <div className="flex items-stretch overflow-hidden rounded-[20px] bg-[var(--color-surface-light)] max-md:h-[120px] max-md:rounded-[16px]">
      <div className="relative shrink-0 bg-[var(--color-surface-light)] max-md:h-[120px] max-md:w-[129px] md:min-h-[170px] lg:min-h-[170px] md:w-[182px] lg:w-[182px]">
        <img
          src={TIER_BOX_IMAGES[theme.tier].src}
          alt={`${plan.name} 이미지`}
          width={TIER_BOX_IMAGES[theme.tier].width}
          height={TIER_BOX_IMAGES[theme.tier].height}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center max-md:gap-1 md:gap-2 lg:gap-2 max-md:px-4 md:p-5 lg:p-5">
        {boxQuantity > 1 && (
          <span
            className="max-md:text-[14px] md:text-[16px] font-semibold leading-tight max-md:mb-1"
            style={{ color: badgeColor }}
          >
            {boxQuantity}BOX
          </span>
        )}

        <div className="flex items-center justify-between gap-2">
          <Text
            variant="subtitle-16-sb"
            mobileVariant="body-14-sb"
            className={`truncate ${isActive ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}
          >
            {isActive ? `${plan.name} ${isPaused ? "구독 쉬는 중" : "구독중"}` : plan.name}
          </Text>
          <Link
            href={`/mypage/subscription/detail?subscriptionId=${subscription.id}`}
            className="shrink-0 transition-opacity hover:opacity-70"
            aria-label="자세히보기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7 4l6 6-6 6" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <Text
          variant="body-16-m"
          mobileVariant="body-13-m"
          className={isActive ? "text-[var(--color-text-label)]" : "text-[var(--color-text-secondary)]"}
        >
          {isActive
            ? `결제일 : ${billingDayLabel(subscription.nextBillingDate)}`
            : "구독종료"}
        </Text>
        <Text
          variant="body-16-m"
          mobileVariant="body-13-m"
          className="text-[var(--color-text-label)]"
        >
          {isActive
            ? `결제금액 : ${formatPrice(plan.monthlyPrice * boxQuantity)}`
            : "-"}
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
    <div className="flex items-center">
      {items.map((item, idx) => {
        const selected = value === item.key;
        return (
          <div key={item.key} className="flex items-center">
            <button
              type="button"
              onClick={() => onChange(item.key)}
              className={`px-2 text-body-16-m transition-colors ${
                selected
                  ? "text-body-16-sb text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {item.label}
            </button>
            {idx < items.length - 1 && (
              <span className="text-body-16-m text-[var(--color-text-secondary)]">|</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────
   Pagination
───────────────────────────── */
const PAGE_SIZE = 6;

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--color-text-label)] transition-colors hover:bg-[var(--color-surface-warm)] disabled:opacity-30"
        aria-label="이전 페이지"
      >
        <ChevronLeftIcon />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${
            page === currentPage
              ? "text-body-14-sb text-[var(--color-text)]"
              : "text-body-14-m text-[var(--color-text-label)] hover:bg-[var(--color-surface-warm)]"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--color-text-label)] transition-colors hover:bg-[var(--color-surface-warm)] disabled:opacity-30"
        aria-label="다음 페이지"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

/* ─────────────────────────────
   Main Section
───────────────────────────── */
export default function SubscriptionManagementSection({ subscriptions, plans, billingInfo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<SubscriptionFilter>("active");
  const [currentPage, setCurrentPage] = useState(1);

  function handleFilterChange(next: SubscriptionFilter) {
    setFilter(next);
    setCurrentPage(1);
  }

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

  const totalPages = Math.ceil(filteredSubscriptions.length / PAGE_SIZE);
  const pagedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const earliestBillingDate = earliestNextBillingDate(activeSubscriptions);
  const hasPlans = plans.length > 0;

  return (
    <div className="relative min-h-screen bg-white">
      {/* Upper solid color band — mobile 367px / desktop 258px */}
      <div className="absolute left-0 right-0 top-0 max-md:h-[367px] md:h-[258px] bg-[var(--color-subscription-header-bg)]" />

      {/* Hero content — overlaps the 258px boundary */}
      <div className="relative mx-auto max-w-content max-md:px-4 md:px-0 lg:px-0 pt-6 md:pt-10 lg:pt-10">
        {/* Back + title */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-subtitle-18-b text-[var(--color-text)] hover:opacity-70"
        >
          <ChevronLeftIcon />
          구독관리
        </button>

        {/* Two summary cards — mobile: single card w/ divider, desktop: unified shadow card */}
        <div className="max-md:overflow-hidden max-md:rounded-[20px] max-md:bg-white max-md:shadow-[0px_4px_12px_0px_#00000014] md:flex lg:flex md:rounded-[20px] lg:rounded-[20px] md:bg-white lg:bg-white md:shadow-[0px_4px_12px_0px_#00000014] lg:shadow-[0px_4px_12px_0px_#00000014]">
          <SubscriptionsSummaryCard activeSubscriptions={activeSubscriptions} />
          {/* Mobile: horizontal divider */}
          <div className="mx-5 border-t border-[var(--color-border-light)] md:hidden lg:hidden" />
          {/* Desktop: vertical divider */}
          <div className="max-md:hidden w-px shrink-0 bg-[#EEEEEE] my-10" />
          <PaymentInfoCard billingInfo={billingInfo} nextBillingDate={earliestBillingDate} />
        </div>
      </div>

      {/* Subscription list — 구독 전체보기 */}
      <div className="relative mx-auto max-w-content max-md:px-4 md:px-0 lg:px-0 pt-8 pb-10">
        <div className="md:px-0 lg:px-0">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 max-md:mb-3">
              <div className="flex items-center gap-3">
                <Text as="h2" variant="subtitle-18-b" className="text-[var(--color-text)]">
                  구독 전체보기
                </Text>
                <Link
                  href="/mypage/subscription/change"
                  className="inline-flex h-[24px] items-center rounded-[4px] bg-[var(--color-text)] px-2 text-[13px] font-medium leading-[16px] text-white transition-opacity hover:opacity-80"
                >
                  구독추가
                </Link>
              </div>
              {/* 태블릿·데스크탑: 타이틀 행 우측 */}
              <div className="max-md:hidden">
                <SubscriptionFilterTabs value={filter} onChange={handleFilterChange} />
              </div>
            </div>
            {/* 모바일: 별도 행 우측 정렬 */}
            <div className="max-md:flex max-md:justify-end md:hidden">
              <SubscriptionFilterTabs value={filter} onChange={handleFilterChange} />
            </div>
          </div>

          {!hasPlans ? (
            <p className="text-body-14-m text-[var(--color-text-label)]">
              플랜 정보를 불러올 수 없습니다.
            </p>
          ) : filteredSubscriptions.length === 0 ? (
            <p className="text-body-14-m text-[var(--color-text-label)]">
              {filter === "ended"
                ? "구독종료된 항목이 없습니다."
                : "구독 내역이 없습니다."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 md:gap-3 lg:gap-8">
                {pagedSubscriptions.map((subscription) => (
                  <SubscriptionRow key={subscription.id} subscription={subscription} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
