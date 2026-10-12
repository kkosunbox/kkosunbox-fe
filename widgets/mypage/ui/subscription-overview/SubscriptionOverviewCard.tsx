import type { ReactNode } from "react";
import { TIER_BOX_IMAGES, packageThemeForPlan } from "@/entities/package";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import { getSubscriptionDisplayBucket } from "@/features/subscription/lib/subscriptionDisplayBucket";
import { subscriptionPaidAmount } from "@/features/subscription/lib/subscriptionAmount";
import { formatDateToYMD } from "@/features/order";

/** 주황 테두리 주 버튼 (구독 상세보기·구독 변경 등) */
export const OVERVIEW_PRIMARY_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center rounded-[8px] border border-[var(--color-cta-button)] bg-white px-2 text-body-14-sb leading-[150%] tracking-[-0.02em] text-[var(--color-cta-button)] transition-opacity hover:opacity-80";

/** 회색 테두리 보조 버튼 (구독 취소·구독 재개 등) */
export const OVERVIEW_SECONDARY_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center rounded-[8px] border border-[var(--color-text-muted)] bg-white px-2 text-body-13-sb leading-[150%] tracking-[-0.02em] text-[var(--color-text-label)] transition-opacity hover:opacity-80";

/** 카드 우측 상단 밑줄 텍스트 버튼 (구독 쉬어가기·삭제) */
export const OVERVIEW_HEADER_LINK_CLASS =
  "text-body-13-sb leading-[130%] text-[var(--color-text-secondary)] underline transition-opacity hover:opacity-70";

function formatDate(dateStr: string): string {
  return dateStr.slice(0, 10).replace(/-/g, ".");
}

function formatPrice(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

/** `YYYY-MM-DD` 두 날짜의 일수 차이. 문자열만 파싱해 타임존 오차를 피한다. */
function daysBetween(fromYMD: string, toYMD: string): number {
  const toUtc = (ymd: string) => {
    const [y, m, d] = ymd.slice(0, 10).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(toYMD) - toUtc(fromYMD)) / 86_400_000);
}

/** 다음 결제일 칸에 들어갈 큰 값 + 보조 문구 */
function billingSummary(subscription: UserSubscriptionDto): { value: string; sub: string | null } {
  if (getSubscriptionDisplayBucket(subscription.status) === "ended") {
    const endedAt = subscription.cancelledAt ?? subscription.terminatedAt;
    return { value: "해지 완료", sub: endedAt ? `(${formatDate(endedAt)})` : null };
  }
  if (subscription.isPaused) {
    return {
      value: "쉬어가기 중",
      sub: subscription.nextBillingDate ? `(${formatDate(subscription.nextBillingDate)} 재개 예정)` : null,
    };
  }

  if (!subscription.nextBillingDate) return { value: "-", sub: null };
  const value = formatDate(subscription.nextBillingDate);
  const today = formatDateToYMD(new Date());
  // 이미 지난 날짜(결제 지연 등)는 남은 일수를 표시하지 않는다.
  if (subscription.nextBillingDate < today) return { value, sub: null };
  const days = daysBetween(today, subscription.nextBillingDate);
  return { value, sub: days === 0 ? "(오늘)" : `(${days}일 후)` };
}

interface Props {
  subscription: UserSubscriptionDto;
  /** 구독번호 옆 날짜 (YYYY-MM-DD). 없으면 생략 */
  date?: string | null;
  /** 우측 상단 요소 (목록: 상세 이동 화살표, 상세: 쉬어가기/삭제) */
  headerAction?: ReactNode;
  /** 다음 결제일 큰 값 영역 대체 (상세의 결제일 수정 UI) */
  billingValue?: ReactNode;
  /** 주 버튼 (주황 테두리, 단독 행) */
  primaryAction?: ReactNode;
  /** 보조 버튼들 (주 버튼 아래 한 행에 균등 분할) */
  secondaryActions?: ReactNode[];
}

/**
 * 구독 목록·상세 공용 구독 카드 (Figma 1240×224).
 * 데스크탑은 가로 1행, 데스크탑 미만은 정보 → 금액 → 버튼 순으로 세로로 쌓는다.
 */
export function SubscriptionOverviewCard({
  subscription,
  date,
  headerAction,
  billingValue,
  primaryAction,
  secondaryActions = [],
}: Props) {
  const { plan, isPaused } = subscription;
  const theme = packageThemeForPlan(plan);
  const isEnded = getSubscriptionDisplayBucket(subscription.status) === "ended";
  const chipColor = isEnded ? "var(--color-text-secondary)" : theme.colorVar;
  const boxQuantity = subscription.quantity || 1;
  const paidAmount = subscriptionPaidAmount(subscription);
  const billing = billingSummary(subscription);
  const hasActions = Boolean(primaryAction) || secondaryActions.length > 0;

  return (
    <div className="rounded-[20px] border border-[var(--color-text-muted)] bg-white max-lg:p-5 lg:px-9 lg:pt-[21px] lg:pb-[23px]">
      {/* 구독번호 · 날짜 · 우측 액션 */}
      <div className="flex min-h-6 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center max-md:gap-2 md:gap-4">
          <span className="max-md:text-body-14-sb md:text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]">
            구독번호 {subscription.id}
          </span>
          {date && (
            <span className="max-md:text-body-13-m md:text-body-14-m tracking-[-0.04em] text-[var(--color-text-secondary)]">
              {formatDate(date)}
            </span>
          )}
        </div>
        {headerAction}
      </div>

      <div className="flex max-lg:mt-4 max-lg:flex-col lg:mt-[7px] lg:h-[147px] lg:items-stretch">
        {/* 이미지 + 플랜 정보 */}
        <div className="flex min-w-0 items-start max-md:gap-4 md:gap-[34px] lg:flex-1 lg:pt-[25px]">
          <div className="relative shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-surface-light)] max-md:h-[83px] max-md:w-[90px] md:h-[111px] md:w-[120px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- 플랜 박스 이미지 원본 품질 유지 */}
            <img
              src={plan.imageUrl ?? TIER_BOX_IMAGES[theme.tier].src}
              alt={`${plan.name} 이미지`}
              width={TIER_BOX_IMAGES[theme.tier].width}
              height={TIER_BOX_IMAGES[theme.tier].height}
              decoding="async"
              className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
            />
            {isPaused && !isEnded && (
              <>
                <div className="absolute inset-0 z-10 bg-black/30" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element -- 첨부 디자인 원본 SVG 유지 */}
                <img src="/images/subscription-paused.svg" alt="" width="98" height="24" className="absolute left-1/2 top-1/2 z-20 h-auto -translate-x-1/2 -translate-y-1/2 max-md:w-[72px] md:w-[98px]" aria-hidden="true" />
              </>
            )}
          </div>

          <div className="flex min-w-0 flex-col max-md:gap-2 max-md:pt-1 md:gap-3 md:pt-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-6 w-fit items-center rounded-full px-3 text-body-14-sb leading-[17px] text-white"
                style={{ background: chipColor }}
              >
                {theme.tierLabel}
              </span>
              {boxQuantity > 1 && (
                <span className="text-body-14-sb leading-[17px]" style={{ color: chipColor }}>
                  {boxQuantity}BOX
                </span>
              )}
            </div>
            <span className="truncate max-md:text-body-16-sb md:text-subtitle-18-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]">
              {plan.name}
            </span>
            <span className="max-md:text-body-14-m md:text-body-16-m tracking-[-0.05em] text-[var(--color-text-secondary)]">
              구독상품
            </span>
          </div>
        </div>

        {/* 다음 결제일 · 총 결제금액 */}
        <div className="flex max-lg:mt-4 max-lg:border-t max-lg:border-[var(--color-border-light)] max-lg:pt-4">
          <div className="flex flex-col max-lg:flex-1 lg:w-[183px] lg:border-l lg:border-[var(--color-text-muted)] lg:pl-8 lg:pt-10">
            <span className="text-body-13-m leading-4 text-[var(--color-text-secondary)]">다음 결제일</span>
            <div className="mt-1 flex min-h-7 items-center">
              {billingValue ?? (
                <span className="text-price-20-eb-lh24 text-[var(--color-text)]">
                  {billing.value}
                </span>
              )}
            </div>
            {billing.sub && (
              <span className="mt-1 text-body-13-m leading-4 text-[var(--color-text-secondary)]">
                {billing.sub}
              </span>
            )}
          </div>
          <div className="flex flex-col max-lg:flex-1 max-lg:border-l max-lg:border-[var(--color-border-light)] max-lg:pl-4 lg:w-[158px] lg:border-l lg:border-[var(--color-text-muted)] lg:pl-8 lg:pt-10">
            <span className="text-body-13-m leading-4 text-[var(--color-text-secondary)]">총 결제금액</span>
            <div className="mt-1 flex min-h-7 items-center">
              <span className="text-price-20-eb-lh24 text-[var(--color-text)]">
                {paidAmount !== null ? formatPrice(paidAmount) : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        {hasActions && (
          <div className="flex gap-2 max-lg:mt-5 lg:w-[173px] lg:shrink-0 lg:flex-col lg:self-center">
            {primaryAction && <div className="flex max-lg:flex-1 [&>*]:w-full">{primaryAction}</div>}
            {secondaryActions.length > 0 && (
              <div className="flex gap-2 max-lg:contents lg:gap-[9px]">
                {secondaryActions.map((action, idx) => (
                  <div key={idx} className="flex flex-1 [&>*]:w-full">
                    {action}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
