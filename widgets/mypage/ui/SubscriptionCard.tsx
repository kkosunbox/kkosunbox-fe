"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Text } from "@/shared/ui";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";

const MAX_VISIBLE_INDICATORS = 7;

function billingDayLabel(nextBillingDate: string): string {
  const day = parseInt(nextBillingDate.slice(8, 10), 10);
  return `매월 ${day}일`;
}

function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

function getCarouselIndicatorItems(
  activeIndex: number,
  total: number,
): Array<{ index: number; offset: number }> {
  if (total <= 1) return [];

  const visibleCount = Math.min(total, MAX_VISIBLE_INDICATORS);
  const startOffset = -Math.floor((visibleCount - 1) / 2);

  return Array.from({ length: visibleCount }, (_, i) => {
    const offset = startOffset + i;
    return {
      index: wrapIndex(activeIndex + offset, total),
      offset,
    };
  });
}

function PrevArrowIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M16 8L10 14L16 20" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NextArrowIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M12 8L18 14L12 20" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        className="inline-flex h-10 w-full max-w-[271px] items-center justify-center rounded-[8px] bg-[var(--color-accent)] text-body-16-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
      >
        구독하러 가기
      </Link>
    </div>
  );
}

function dotSizeClass(offset: number): string {
  const distance = Math.abs(offset);
  if (distance === 0) return "h-2.5 w-2.5";
  if (distance === 1) return "h-2.5 w-2.5";
  if (distance === 2) return "h-2 w-2";
  return "h-1.5 w-1.5";
}

function dotOpacityClass(offset: number): string {
  const distance = Math.abs(offset);
  if (distance <= 1) return "opacity-100";
  if (distance === 2) return "opacity-80";
  return "opacity-60";
}

function dotTransformStyle(offset: number) {
  return {
    transform: `translate(-50%, -50%) translateX(${offset * 16}px)`,
  };
}

function SubscriptionCarouselIndicator({
  activeIndex,
  total,
  onSelect,
  className,
}: {
  activeIndex: number;
  total: number;
  onSelect: (index: number) => void;
  className: string;
}) {
  if (total <= 1) return null;

  const items = getCarouselIndicatorItems(activeIndex, total);

  return (
    <nav
      className={["z-10 flex items-center justify-center", className].join(" ")}
      aria-label="구독 목록 탐색"
    >
      <div className="relative h-4 w-[112px]">
        {items.map(({ index, offset }) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`${index + 1}번째 구독`}
            aria-current={index === activeIndex ? "page" : undefined}
            style={dotTransformStyle(offset)}
            className={`absolute left-1/2 top-1/2 rounded-full transition-[transform,width,height,background-color,opacity] duration-300 ease-out ${dotSizeClass(offset)} ${dotOpacityClass(offset)} ${
              index === activeIndex
                ? "bg-white"
                : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </nav>
  );
}

export function SubscriptionCard({ subscriptions }: { subscriptions: UserSubscriptionDto[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  if (subscriptions.length === 0) {
    return (
      <div className="flex max-lg:min-h-[199px] rounded-[20px] bg-[var(--color-surface-light)] px-6 py-5 max-lg:rounded-[16px] lg:h-[186px]">
        <SubscriptionEmpty />
      </div>
    );
  }

  const hasMultiple = subscriptions.length > 1;
  const current = subscriptions[wrapIndex(activeIndex, subscriptions.length)];
  const planTheme = packageThemeForPlan(current.plan);

  const detailHref = `/mypage/subscription/detail?subscriptionId=${current.id}`;
  const goToPrevious = () => setActiveIndex((i) => wrapIndex(i - 1, subscriptions.length));
  const goToNext = () => setActiveIndex((i) => wrapIndex(i + 1, subscriptions.length));

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (!hasMultiple) return;
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (!hasMultiple || touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = touchStartX.current - touchEndX;
    touchStartX.current = null;

    if (Math.abs(distance) < 40) return;
    didSwipe.current = true;
    window.setTimeout(() => {
      didSwipe.current = false;
    }, 300);

    if (distance > 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  }

  function handleClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (!didSwipe.current) return;
    e.preventDefault();
    e.stopPropagation();
  }

  const startDateStr = current.startDate?.replace(/-/g, ".");

  return (
    <div className="relative max-lg:mb-5 lg:h-[186px]">
      {/* 오렌지 카드 */}
      <div
        className="relative z-0 flex h-full max-lg:min-h-[199px] rounded-[20px] max-lg:rounded-[16px] lg:h-[186px]"
        style={{ background: planTheme.colorVar }}
        onClickCapture={handleClickCapture}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 카드 전체 클릭 — 구독 상세 */}
        <Link
          href={detailHref}
          aria-label={`${current.plan.name} 구독 상세 보기`}
          className={[
            "relative z-0 flex min-w-0 flex-1 flex-col justify-center outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            "max-lg:px-6 max-lg:py-6",
            hasMultiple ? "lg:pl-12 lg:pr-6 lg:py-5" : "lg:px-6 lg:py-5",
          ].join(" ")}
        >
          {/* 티어 뱃지 */}
          <div className="mb-3">
            <span
              className="inline-flex h-[24px] items-center rounded-full bg-white px-3 text-body-14-sb leading-[1]"
              style={{ color: planTheme.colorVar }}
            >
              {planTheme.tierLabel}
            </span>
          </div>

          {/* 텍스트 정보 */}
          <div className="flex flex-col gap-1">
            <Text
              variant="subtitle-16-sb"
              mobileVariant="body-14-sb"
              className="leading-tight tracking-[-0.04em] text-white"
            >
              {current.plan.name} 구독중
            </Text>
            {startDateStr && (
              <Text
                variant="body-16-m"
                mobileVariant="body-14-m"
                className="leading-tight text-white/80"
              >
                {startDateStr} ~
              </Text>
            )}
            <Text
              variant="body-16-m"
              mobileVariant="body-14-m"
              className="leading-tight text-white/80"
            >
              결제일 : {billingDayLabel(current.nextBillingDate)}
            </Text>
          </div>
        </Link>

        {/* 구독관리 */}
        <Link
          href="/mypage/subscription"
          className="absolute right-6 top-5 z-10 max-lg:text-body-13-sb lg:text-body-14-sb text-white underline transition-opacity hover:opacity-80"
        >
          구독관리
        </Link>

        {/* 도트 인디케이터 — 데스크톱: 카드 하단 */}
        <SubscriptionCarouselIndicator
          activeIndex={activeIndex}
          total={subscriptions.length}
          onSelect={setActiveIndex}
          className="absolute bottom-4 left-0 right-0 max-lg:hidden"
        />
      </div>

      {/* 노치 원 + 화살표 버튼 — 여러 구독일 때만 표시, 데스크톱 전용 */}
      {hasMultiple && (
        <>
          {/* 왼쪽 노치 (불투명 흰색 원, 카드 left edge 중앙) */}
          <div
            className="absolute left-0 top-1/2 z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white max-lg:hidden"
            aria-hidden
          />
          {/* 왼쪽 화살표 버튼 */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/50 shadow-[2px_2px_4px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-80 max-lg:hidden"
            aria-label="이전 구독"
          >
            <PrevArrowIcon />
          </button>

          {/* 오른쪽 노치 (불투명 흰색 원, 카드 right edge 중앙) */}
          <div
            className="absolute right-0 top-1/2 z-10 h-12 w-12 translate-x-1/2 -translate-y-1/2 rounded-full bg-white max-lg:hidden"
            aria-hidden
          />
          {/* 오른쪽 화살표 버튼 */}
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 z-20 flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 shadow-[2px_2px_4px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-80 max-lg:hidden"
            aria-label="다음 구독"
          >
            <NextArrowIcon />
          </button>
        </>
      )}

      {/* 도트 인디케이터 — 모바일: 카드 외부 하단 */}
      <SubscriptionCarouselIndicator
        activeIndex={activeIndex}
        total={subscriptions.length}
        onSelect={setActiveIndex}
        className="pt-3 lg:hidden"
      />
    </div>
  );
}
