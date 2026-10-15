"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/shared/ui";
import { openCenteredPopup } from "@/shared/lib/popup";
import type { BillingInfo } from "@/features/billing/api/types";
import { useBillingUpdatedAlert } from "@/features/billing/lib/billingSync";
import { getCardName, getLastFourDigits } from "@/features/billing/lib/formatBillingLabel";
import type { UserSubscriptionDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import {
  getSubscriptionDisplayBucket,
  isScheduledSubscription,
} from "@/features/subscription/lib/subscriptionDisplayBucket";
import { totalSubscriptionPaidAmount } from "@/features/subscription/lib/subscriptionAmount";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
} from "@/entities/package";
import { PAYMENT_REGISTER_CHIP_BUTTON_ACCENT_CLASS } from "../lib/dashboard-shared";
import { Pagination } from "./subscription-detail/components/Pagination";
import {
  OVERVIEW_PRIMARY_BUTTON_CLASS,
  OVERVIEW_SECONDARY_BUTTON_CLASS,
  SubscriptionOverviewCard,
} from "./subscription-overview/SubscriptionOverviewCard";
import { useSubscriptionRowActions } from "./subscription-overview/useSubscriptionRowActions";

type SubscriptionFilter = "all" | "active" | "paused" | "ended";

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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Figma Add_round — 20×20 plus icon */
function AddRoundIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 5V15" stroke="var(--color-text-label)" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 10H15" stroke="var(--color-text-label)" strokeWidth="2" strokeLinecap="round" />
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

/* 가장 가까운 다음 결제일 (오름차순 정렬 첫 항목) */
function earliestNextBillingDate(subs: UserSubscriptionDto[]): string | null {
  const dates = subs.map((s) => s.nextBillingDate).filter(Boolean);
  if (dates.length === 0) return null;
  return [...dates].sort()[0];
}

/** 목록 탭 분류 — 구독중(쉬는 중 제외) / 쉬어가기(쉬는 중) / 해지완료 */
function filterKeyOf(subscription: UserSubscriptionDto): Exclude<SubscriptionFilter, "all"> {
  if (getSubscriptionDisplayBucket(subscription.status) === "ended") return "ended";
  return subscription.isPaused ? "paused" : "active";
}

/* ─────────────────────────────
   Subscriptions Summary Card (좌측)
───────────────────────────── */
function SubscriptionsSummaryCard({
  activeSubscriptions,
  billableSubscriptions,
  hasPlans,
}: {
  activeSubscriptions: UserSubscriptionDto[];
  /** 쉬는 중(isPaused)이 아닌, 이번 주기에 실제로 청구되는 구독만. "결제 금액" 합계 계산 전용 */
  billableSubscriptions: UserSubscriptionDto[];
  hasPlans: boolean;
}) {
  const count = activeSubscriptions.length;
  const totalAmount = totalSubscriptionPaidAmount(billableSubscriptions);

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
    <div className="max-md:p-5 md:flex-1 md:px-8 lg:px-11 md:py-8 lg:pt-10 lg:pb-[41px]">
      {aggregatedPlans.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          {aggregatedPlans.map(({ plan, totalQuantity }) => {
            const theme = packageThemeForPlan(plan);
            return (
              <div key={plan.id} className="inline-flex items-center gap-3">
                <span
                  className="inline-flex h-6 items-center rounded-full px-3 text-body-14-sb leading-[17px] text-white"
                  style={{ background: theme.colorVar }}
                >
                  {theme.tierLabel}
                </span>
                {totalQuantity > 1 && (
                  <span
                    className="text-subtitle-16-b-tight"
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

      <Text as="h3" variant="title-20-b" mobileVariant="subtitle-16-b" className="mb-5 text-[var(--color-text)]">
        {!hasPlans
          ? "구독 정보를 불러올 수 없습니다"
          : count > 0
          ? `총 ${count}개의 구독 이용중`
          : "이용중인 구독이 없습니다"}
      </Text>

      {hasPlans && (
        <p className="max-md:text-body-14-m md:text-body-16-m text-[var(--color-text-label)]">
          이번달 결제 금액 : {totalAmount !== null ? formatPrice(totalAmount) : "-"}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────
   Payment Info Card (우측)
───────────────────────────── */
function PaymentInfoCard({
  billingInfo: initialBillingInfo,
  nextBillingDateLabel,
}: {
  billingInfo: BillingInfo | null;
  /** "다음 결제일" 표시용 YYYY.MM.DD 문자열 (없으면 "-") */
  nextBillingDateLabel: string;
}) {
  const router = useRouter();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(initialBillingInfo);

  // 서버 재조회(router.refresh) 결과가 로컬 state를 덮어쓰도록 동기화한다.
  useEffect(() => {
    setBillingInfo(initialBillingInfo);
  }, [initialBillingInfo]);

  // 다른 창에서 카드 등록/변경이 끝나면 서버에서 최신 결제수단을 다시 조회하고 완료 모달을 띄운다.
  useBillingUpdatedAlert({
    hadBilling: initialBillingInfo !== null,
    onUpdated: () => router.refresh(),
  });

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

  // 결제수단 변경 팝업. 등록된 카드가 있으면 확인 1단계, 없으면 곧바로 Toss 카드 등록창이 뜬다.
  function handleOpenPayment() {
    openCenteredPopup("/payment?mode=change", "paymentPopup", { width: 650, height: 700 });
  }

  const cardDisplay = billingInfo
    ? `${getCardName(billingInfo)} (${getLastFourDigits(billingInfo)})`
    : "미등록";
  const methodDisplay = billingInfo ? "신용카드 결제" : "미등록";
  const nextDateDisplay =
    nextBillingDateLabel === "-" ? "-" : `${nextBillingDateLabel} (카드결제)`;

  const labelCls = "w-[80px] shrink-0 text-body-13-m leading-4 text-[var(--color-text-label)]";
  const valueCls = "text-body-13-sb leading-4 text-[var(--color-text)]";

  return (
    <div className="flex flex-col max-md:p-5 md:flex-1 md:px-8 lg:px-12 md:py-8 lg:py-10">
      <Text as="h3" variant="subtitle-16-b" className="mb-5 text-[var(--color-text)] lg:mb-[17px]">
        결제관리
      </Text>

      <div className="flex flex-col max-md:gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <span className={labelCls}>결제수단</span>
          <span className={valueCls}>{methodDisplay}</span>
        </div>

        <div className="flex items-start gap-3 md:h-4 md:items-center">
          <span className={labelCls}>간편 결제</span>
          <div className="flex flex-wrap items-center gap-2 md:h-4 md:items-start">
            <span className={valueCls}>{cardDisplay}</span>
            <button
              type="button"
              onClick={handleOpenPayment}
              className={PAYMENT_REGISTER_CHIP_BUTTON_ACCENT_CLASS}
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
   Subscription Row (구독 카드 + 상태별 버튼)
───────────────────────────── */
function SubscriptionRow({
  subscription,
  actions,
}: {
  subscription: UserSubscriptionDto;
  actions: ReturnType<typeof useSubscriptionRowActions>;
}) {
  const filterKey = filterKeyOf(subscription);
  const isScheduled = isScheduledSubscription(subscription.status);
  const detailHref = `/mypage/subscription/detail?subscriptionId=${subscription.id}`;

  const changeButton = (
    <button
      type="button"
      onClick={() => actions.handleChange(subscription.id)}
      className={OVERVIEW_SECONDARY_BUTTON_CLASS}
    >
      구독변경
    </button>
  );

  // 구독중: 구독변경(예약 구독은 변경 불가) / 쉬어가기: 구독 재개 + 구독변경 / 해지: 구독 재시작
  const secondaryActions =
    filterKey === "ended"
      ? [
          <button
            key="restart"
            type="button"
            onClick={() => actions.handleRestart(subscription.id)}
            className={OVERVIEW_SECONDARY_BUTTON_CLASS}
          >
            구독 재시작
          </button>,
        ]
      : filterKey === "paused"
        ? [
            <button
              key="resume"
              type="button"
              onClick={() => actions.handleResume(subscription.id)}
              className={OVERVIEW_SECONDARY_BUTTON_CLASS}
            >
              구독 재개
            </button>,
            changeButton,
          ]
        : isScheduled
          ? []
          : [changeButton];

  return (
    <SubscriptionOverviewCard
      subscription={subscription}
      date={subscription.startDate}
      headerAction={
        <Link
          href={detailHref}
          aria-label={`구독번호 ${subscription.id} 상세보기`}
          className="shrink-0 text-[var(--color-text)] transition-opacity hover:opacity-70"
        >
          <ChevronRightIcon />
        </Link>
      }
      primaryAction={
        <Link href={detailHref} className={OVERVIEW_PRIMARY_BUTTON_CLASS}>
          구독 상세보기
        </Link>
      }
      secondaryActions={secondaryActions}
    />
  );
}

/* ─────────────────────────────
   Filter (전체 / 구독중 / 쉬어가기 / 해지완료)
───────────────────────────── */
function SubscriptionFilterTabs({
  value,
  counts,
  onChange,
}: {
  value: SubscriptionFilter;
  counts: Record<SubscriptionFilter, number>;
  onChange: (next: SubscriptionFilter) => void;
}) {
  const items: { key: SubscriptionFilter; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "active", label: "구독중" },
    { key: "paused", label: "쉬어가기" },
    { key: "ended", label: "해지완료" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const selected = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            aria-pressed={selected}
            className={`inline-flex h-[34px] items-center rounded-full max-md:px-4 md:px-5 text-body-14-sb leading-[17px] transition-colors ${
              selected
                ? "bg-[var(--color-cta-button)] font-bold text-white"
                : "border border-[var(--color-text-muted)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-light)]"
            }`}
          >
            {item.label} {counts[item.key]}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────
   Main Section
───────────────────────────── */
const PAGE_SIZE = 6;

export default function SubscriptionManagementSection({ subscriptions, plans, billingInfo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rowActions = useSubscriptionRowActions();
  const [filter, setFilter] = useState<SubscriptionFilter>("all");
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

  // isActive는 scheduled(시작 예약, 첫 결제 전)를 false로 내려주므로 탭 분류엔 쓰지 않는다.
  // "구독중"/"해지완료" 판단은 항상 status 기반 getSubscriptionDisplayBucket을 거친다.
  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => getSubscriptionDisplayBucket(s.status) === "active"),
    [subscriptions],
  );

  // 쉬는 중(isPaused)인 구독은 이번 결제 주기에 청구되지 않는다 — "다음 결제일"/"예상 결제
  // 금액" 계산에 넣으면 지나간 결제일이 최솟값으로 잡히는 등 실제와 다른 값이 나온다.
  const billableSubscriptions = useMemo(
    () => activeSubscriptions.filter((s) => !s.isPaused),
    [activeSubscriptions],
  );

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const aActive = getSubscriptionDisplayBucket(a.status) === "active";
      const bActive = getSubscriptionDisplayBucket(b.status) === "active";
      if (aActive !== bActive) return aActive ? -1 : 1;
      return comparePlansForDisplayOrder(a.plan, b.plan);
    });
  }, [subscriptions]);

  const filterCounts = useMemo(() => {
    const counts: Record<SubscriptionFilter, number> = {
      all: subscriptions.length,
      active: 0,
      paused: 0,
      ended: 0,
    };
    for (const s of subscriptions) counts[filterKeyOf(s)] += 1;
    return counts;
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    if (filter === "all") return sortedSubscriptions;
    return sortedSubscriptions.filter((s) => filterKeyOf(s) === filter);
  }, [sortedSubscriptions, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / PAGE_SIZE));
  const pagedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const earliestBillingDate = earliestNextBillingDate(billableSubscriptions);
  const nextBillingDateLabel = earliestBillingDate
    ? earliestBillingDate.slice(0, 10).replace(/-/g, ".")
    : "-";
  const hasPlans = plans.length > 0;

  const emptyMessage =
    filter === "ended"
      ? "해지완료된 항목이 없습니다."
      : filter === "paused"
        ? "쉬어가기 중인 항목이 없습니다."
        : "구독 내역이 없습니다.";

  return (
    <div className="relative min-h-screen bg-white pt-[var(--header-offset)]">
      {/* Desktop upper solid color band — mobile background follows hero content height */}
      <div className="absolute left-0 right-0 top-[var(--header-offset)] max-md:hidden md:h-[148px] bg-[var(--color-page-header-bg)]" />

      {/* Mobile: ivory background wraps the full hero and always leaves 24px below it. */}
      <section className="relative max-md:bg-[var(--color-page-header-bg)] max-md:pb-6">
        {/* Hero content — desktop overlaps the 148px boundary */}
        <div className="relative mx-auto w-full max-w-[1240px] max-xl:px-6 xl:px-0 pt-6 md:pt-10 lg:pt-10">
          {/* Back + title + 구독 추가하기 */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 max-md:text-subtitle-18-b md:text-title-24-b text-[var(--color-text)] hover:opacity-70"
            >
              <ChevronLeftIcon />
              구독관리
            </button>
            <Link
              href="/subscribe"
              className="box-border inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[24px] border border-[var(--color-text-muted)] bg-white px-3 py-2 text-body-13-m leading-4 text-[var(--color-text)] transition-opacity hover:opacity-80"
            >
              <AddRoundIcon />
              구독 추가하기
            </Link>
          </div>

          {/* Two summary cards — mobile: single card w/ divider, desktop: unified shadow card */}
          <div className="max-md:overflow-hidden max-md:rounded-[20px] max-md:bg-white md:flex md:rounded-[20px] md:bg-white md:shadow-[0px_4px_24px_0px_#00000014]">
            <SubscriptionsSummaryCard
              activeSubscriptions={activeSubscriptions}
              billableSubscriptions={billableSubscriptions}
              hasPlans={hasPlans}
            />
            {/* Mobile: horizontal divider */}
            <div className="mx-5 border-t border-[var(--color-border-light)] md:hidden" />
            {/* Desktop: vertical divider */}
            <div className="max-md:hidden my-[35px] w-px shrink-0 bg-[var(--color-border-light)]" />
            <PaymentInfoCard billingInfo={billingInfo} nextBillingDateLabel={nextBillingDateLabel} />
          </div>
        </div>
      </section>

      {/* Subscription list */}
      <div className="relative mx-auto w-full max-w-[1240px] max-xl:px-6 xl:px-0 max-md:pt-6 md:pt-[41px] pb-16">
        <div className="max-md:mb-5 md:mb-8">
          <SubscriptionFilterTabs value={filter} counts={filterCounts} onChange={handleFilterChange} />
        </div>

        {!hasPlans ? (
          <p className="text-body-14-m text-[var(--color-text-label)] max-md:flex max-md:min-h-[160px] max-md:items-center max-md:justify-center max-md:text-center">
            플랜 정보를 불러올 수 없습니다.
          </p>
        ) : filteredSubscriptions.length === 0 ? (
          <p className="text-body-14-m text-[var(--color-text-label)] max-md:flex max-md:min-h-[160px] max-md:items-center max-md:justify-center max-md:text-center">
            {emptyMessage}
          </p>
        ) : (
          <>
            <div className="flex flex-col max-md:gap-4 md:gap-8">
              {pagedSubscriptions.map((subscription) => (
                <SubscriptionRow key={subscription.id} subscription={subscription} actions={rowActions} />
              ))}
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              onSelect={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
