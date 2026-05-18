"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TIER_THUMBNAILS } from "@/widgets/subscribe/plans/ui/packageThumbnails";
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

function SubscriptionPrevButtonIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <g filter="url(#subscription-prev-edge-shadow)">
        <rect x="2" y="2" width="24" height="24" rx="12" fill="white" fillOpacity="0.3" shapeRendering="crispEdges" />
        <path d="M16.666 8.66663L10.666 14L16.666 19.3333" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="subscription-prev-edge-shadow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="2" dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_subscription_prev" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_subscription_prev" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

function SubscriptionNextButtonIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <g filter="url(#subscription-next-edge-shadow)">
        <rect width="24" height="24" rx="12" transform="matrix(-1 0 0 1 26 2)" fill="white" fillOpacity="0.3" shapeRendering="crispEdges" />
        <path d="M11.334 8.66663L17.334 14L11.334 19.3333" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="subscription-next-edge-shadow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="2" dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_subscription_next" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_subscription_next" result="shape" />
        </filter>
      </defs>
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
      className={[
        "z-10 flex items-center justify-center",
        className,
      ].join(" ")}
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
                ? "bg-[var(--color-accent)]"
                : "bg-[var(--color-border)]"
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
      <div className="flex rounded-[20px] max-md:bg-white max-md:px-5 max-md:py-5 md:bg-[var(--color-surface-light)] md:min-h-[173px] md:px-6 md:py-5">
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

  return (
    <div>
      <div
        className="relative flex rounded-[20px] max-md:bg-white md:h-[173px] md:bg-[var(--color-background)]"
        onClickCapture={handleClickCapture}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 사진 + 구독 정보 — 클릭 시 해당 구독 상세 */}
        <Link
          href={detailHref}
          aria-label={`${current.plan.name} 구독 상세 보기`}
          className="relative z-0 flex min-w-0 flex-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] max-md:focus-visible:ring-offset-white"
        >
          {/* 이미지 — 카드 왼쪽에 패딩 없이 full-height */}
          <div className="relative max-md:w-[100px] md:w-[160px] shrink-0 self-stretch overflow-hidden rounded-l-[20px]">
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
          className="absolute right-8 top-5 z-10 max-md:text-body-13-sb md:text-body-14-sb text-[var(--color-accent)] underline transition-opacity hover:opacity-80"
        >
          구독관리
        </Link>

        {/* 좌우 화살표 — 여러 구독일 때만 표시 */}
        {hasMultiple && (
          <button
            onClick={goToPrevious}
            className="absolute left-[-16px] top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center transition-opacity hover:opacity-80 max-md:hidden"
            aria-label="이전 구독"
          >
            <SubscriptionPrevButtonIcon />
          </button>
        )}
        {hasMultiple && (
          <button
            onClick={goToNext}
            className="absolute right-[-16px] top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center transition-opacity hover:opacity-80 max-md:hidden"
            aria-label="다음 구독"
          >
            <SubscriptionNextButtonIcon />
          </button>
        )}

        {/* 도트 인디케이터 — 데스크톱: 카드 안 absolute */}
        <SubscriptionCarouselIndicator
          activeIndex={activeIndex}
          total={subscriptions.length}
          onSelect={setActiveIndex}
          className="absolute bottom-4 left-0 right-0 md:translate-x-8 max-md:hidden"
        />
      </div>

      {/* 도트 인디케이터 — 모바일: 카드 외부 하단 */}
      <SubscriptionCarouselIndicator
        activeIndex={activeIndex}
        total={subscriptions.length}
        onSelect={setActiveIndex}
        className="pt-3 md:hidden"
      />
    </div>
  );
}
