"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TIER_THUMBNAILS } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { Text } from "@/shared/ui";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";

function billingDayLabel(nextBillingDate: string): string {
  const day = parseInt(nextBillingDate.slice(8, 10), 10);
  return `매월 ${day}일`;
}

function ChevronLeft() {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden>
      <path d="M9 1L1 9L9 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden>
      <path d="M1 1L9 9L1 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubscriptionEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
      <Text
        variant="body-14-m"
        className="leading-5 tracking-[-0.04em] text-[var(--color-text-emphasis)]"
      >
        아직 구독 전이시군요!
        <br />
        꼬순박스 구독으로 건강한 간식을 만나보세요.
      </Text>
      <Link
        href="/subscribe"
        className="inline-flex h-10 w-full max-w-[271px] items-center justify-center rounded-[30px] bg-[var(--color-accent)] text-body-16-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
      >
        구독하러 가기
      </Link>
    </div>
  );
}

export function SubscriptionCard({ subscriptions }: { subscriptions: UserSubscriptionDto[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (subscriptions.length === 0) {
    return (
      <div className="flex rounded-[20px] max-md:bg-white max-md:px-5 max-md:py-5 md:bg-[var(--color-surface-light)] md:min-h-[173px] md:px-6 md:py-5">
        <SubscriptionEmpty />
      </div>
    );
  }

  const hasMultiple = subscriptions.length > 1;
  const current = subscriptions[Math.min(activeIndex, subscriptions.length - 1)];
  const planTheme = packageThemeForPlan(current.plan);

  const detailHref = `/mypage/subscription/detail?subscriptionId=${current.id}`;

  return (
    <div>
      <div className="relative flex overflow-hidden rounded-[20px] max-md:bg-white md:h-[173px] md:bg-[var(--color-background)]">
        {/* 사진 + 구독 정보 — 클릭 시 해당 구독 상세 */}
        <Link
          href={detailHref}
          aria-label={`${current.plan.name} 구독 상세 보기`}
          className="relative z-0 flex min-w-0 flex-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] max-md:focus-visible:ring-offset-white"
        >
          {/* 이미지 — 카드 왼쪽에 패딩 없이 full-height */}
          <div className="relative max-md:w-[100px] md:w-[160px] shrink-0 self-stretch">
            <Image
              src={TIER_THUMBNAILS[planTheme.tier]}
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* 텍스트 콘텐츠 */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 max-md:px-4 max-md:py-5 md:px-8">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-[24px] w-fit shrink-0 items-center rounded-full px-[12px] max-md:text-body-13-sb md:text-body-14-sb leading-[1] text-white"
                style={{ background: planTheme.colorVar }}
              >
                {planTheme.tierLabel}
              </span>
              <span
                className="max-md:text-body-13-sb md:text-body-14-sb leading-[1]"
                style={{ fontWeight: 700, color: planTheme.colorVar }}
              >
                {current.quantity}BOX
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <Text
                variant="subtitle-16-sb"
                mobileVariant="body-14-sb"
                className="leading-tight tracking-[-0.04em] text-[var(--color-text)]"
              >
                {current.plan.name} 구독중
              </Text>
              <Text
                variant="body-14-m"
                className="leading-tight text-[var(--color-text-secondary)]"
              >
                결제일 : {billingDayLabel(current.nextBillingDate)}
              </Text>
              <Text
                variant="body-14-m"
                className="leading-tight text-[var(--color-text-secondary)]"
              >
                다음 결제 : {current.nextBillingDate.replace(/-/g, ".")}
              </Text>
            </div>
          </div>
        </Link>

        {/* 구독관리 */}
        <Link
          href="/mypage/subscription"
          className="absolute right-5 top-5 z-10 max-md:text-body-13-sb md:text-body-14-sb text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
        >
          구독관리
        </Link>

        {/* 좌우 화살표 — 여러 구독일 때만 표시 */}
        {hasMultiple && (
          <button
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            disabled={activeIndex === 0}
            className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[var(--color-border)] transition-opacity disabled:opacity-30 hover:opacity-70"
            aria-label="이전 구독"
          >
            <ChevronLeft />
          </button>
        )}
        {hasMultiple && (
          <button
            onClick={() => setActiveIndex((i) => Math.min(subscriptions.length - 1, i + 1))}
            disabled={activeIndex === subscriptions.length - 1}
            className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[var(--color-text-secondary)] transition-opacity disabled:opacity-30 hover:opacity-70"
            aria-label="다음 구독"
          >
            <ChevronRight />
          </button>
        )}

        {/* 도트 인디케이터 — 데스크톱: 카드 안 absolute */}
        {hasMultiple && (
          <div className="max-md:hidden absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-3">
            {subscriptions.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`${i + 1}번째 구독`}
                className={`h-3 w-3 rounded-full transition-colors ${
                  i === activeIndex
                    ? "bg-[var(--color-accent)]"
                    : "bg-[var(--color-border)]"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 도트 인디케이터 — 모바일: 카드 외부 하단 */}
      {hasMultiple && (
        <div className="md:hidden flex justify-center gap-3 pt-3">
          {subscriptions.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`${i + 1}번째 구독`}
              className={`h-3 w-3 rounded-full transition-colors ${
                i === activeIndex
                  ? "bg-[var(--color-accent)]"
                  : "bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
