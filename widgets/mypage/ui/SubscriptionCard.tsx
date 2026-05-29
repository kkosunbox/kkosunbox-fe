"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Text } from "@/shared/ui";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";

/* 도트 인디케이터 슬라이드 설정 */
const DOT_PITCH = 16; // 점 사이 간격(px)
const DOT_WINDOW = 4; // 활성 기준 좌우로 렌더링할 슬롯 수(가장자리는 페이드/클립)
const DOT_VIEW_WIDTH = 7 * DOT_PITCH; // 뷰포트 너비 — 가운데 기준 ±3.5칸 노출
const SLIDE_MS = 320;
const DOT_STATIC_MAX = 19; // 이 개수 이하는 전통적 dot 표시, 초과 시 무한 슬라이딩 방식

function billingDayLabel(nextBillingDate: string): string {
  const day = parseInt(nextBillingDate.slice(8, 10), 10);
  return `매월 ${day}일`;
}

function subscriptionPaymentAmount(subscription: UserSubscriptionDto): number {
  return subscription.plan.monthlyPrice * (subscription.quantity || 1);
}

function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* 가운데(거리 0)에서 멀어질수록 작아지고 흐려짐 */
function dotSizeForDistance(distance: number): number {
  return Math.max(5, 10 - 1.4 * distance);
}

function dotOpacityForDistance(distance: number): number {
  return Math.max(0, 1 - 0.26 * distance);
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

/**
 * 구독 개수에 따라 인디케이터 방식을 자동 선택.
 * ≤ DOT_STATIC_MAX: 전체 dot를 나열하고 활성 dot를 강조 표시.
 * > DOT_STATIC_MAX: position 기준 슬라이딩 가상화 방식(양쪽 페이드).
 */
function SubscriptionCarouselIndicator({
  position,
  total,
  onSelectSlot,
  className,
}: {
  position: number;
  total: number;
  onSelectSlot: (slot: number) => void;
  className: string;
}) {
  if (total <= 1) return null;

  /* ── 전통적 dot (≤ 19개) ── */
  if (total <= DOT_STATIC_MAX) {
    const activeIndex = wrapIndex(Math.round(position), total);
    return (
      <nav
        className={["z-10 flex items-center justify-center gap-[6px]", className].join(" ")}
        aria-label="구독 목록 탐색"
      >
        {Array.from({ length: total }, (_, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectSlot(i)}
              aria-label={`${i + 1}번째 구독`}
              aria-current={isActive ? "page" : undefined}
              className="rounded-full bg-white transition-all duration-200"
              style={{
                width: isActive ? 10 : 9,
                height: isActive ? 10 : 9,
                opacity: isActive ? 1 : 0.45,
              }}
            />
          );
        })}
      </nav>
    );
  }

  /* ── 슬라이딩 가상화 dot (20개 이상) ── */
  const centerSlot = Math.round(position);
  const fadeMask =
    "linear-gradient(to right, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)";

  const slots: number[] = [];
  for (let slot = centerSlot - DOT_WINDOW; slot <= centerSlot + DOT_WINDOW; slot += 1) {
    slots.push(slot);
  }

  return (
    <nav
      className={["z-10 flex items-center justify-center", className].join(" ")}
      aria-label="구독 목록 탐색"
    >
      <div
        className="relative h-4"
        style={{
          width: DOT_VIEW_WIDTH,
          maskImage: fadeMask,
          WebkitMaskImage: fadeMask,
        }}
      >
        {slots.map((slot) => {
          const index = wrapIndex(slot, total);
          const distance = Math.abs(slot - position);
          const size = dotSizeForDistance(distance);
          const opacity = dotOpacityForDistance(distance);
          const isCenter = slot === centerSlot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectSlot(slot)}
              aria-label={`${index + 1}번째 구독`}
              aria-current={isCenter ? "page" : undefined}
              className="absolute left-1/2 top-1/2 rounded-full bg-white"
              style={{
                width: size,
                height: size,
                opacity,
                transform: `translate(-50%, -50%) translateX(${(slot - position) * DOT_PITCH}px)`,
              }}
            />
          );
        })}
      </div>
    </nav>
  );
}

export function SubscriptionCard({ subscriptions }: { subscriptions: UserSubscriptionDto[] }) {
  const total = subscriptions.length;

  // 활성 구독 인덱스(0..total-1) — 카드 내용의 단일 소스
  const [activeIndex, setActiveIndex] = useState(0);
  // 도트 슬라이드용 연속 위치(언바운드). 활성 슬롯 = round(position).
  const [position, setPosition] = useState(0);

  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const tweenRef = useRef<{ from: number; to: number; start: number } | null>(null);

  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (total === 0) {
    return (
      <div className="flex max-lg:min-h-[199px] rounded-[20px] bg-[var(--color-surface-light)] px-6 py-5 max-lg:rounded-[16px] lg:h-[186px]">
        <SubscriptionEmpty />
      </div>
    );
  }

  const hasMultiple = total > 1;
  const current = subscriptions[wrapIndex(activeIndex, total)];
  const planTheme = packageThemeForPlan(current.plan);
  const detailHref = `/mypage/subscription/detail?subscriptionId=${current.id}`;
  const paymentAmount = subscriptionPaymentAmount(current);

  /* 연속 위치를 target까지 부드럽게 보간 (rAF) */
  function animateTo(target: number) {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    targetRef.current = target;

    if (prefersReducedMotion()) {
      setPosition(target);
      setActiveIndex(wrapIndex(target, total));
      return;
    }

    tweenRef.current = { from: position, to: target, start: performance.now() };

    const tick = (now: number) => {
      const tween = tweenRef.current;
      if (!tween) return;
      const t = Math.min(1, (now - tween.start) / SLIDE_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setPosition(tween.from + (tween.to - tween.from) * eased);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setPosition(tween.to);
        setActiveIndex(wrapIndex(tween.to, total));
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  /* 한 칸 이동 (현재 target 기준으로 누적 → 연타 시 부드럽게 리타게팅) */
  function step(dir: number) {
    if (!hasMultiple) return;
    animateTo(targetRef.current + dir);
  }

  /* 도트 클릭 — 해당 슬롯으로 이동 (현재 화면 근처 슬롯이라 짧게 슬라이드) */
  function goToSlot(slot: number) {
    if (!hasMultiple) return;
    animateTo(slot);
  }

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

    step(distance > 0 ? 1 : -1);
  }

  function handleClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (!didSwipe.current) return;
    e.preventDefault();
    e.stopPropagation();
  }

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
            "max-lg:px-6 max-lg:py-6 lg:pl-12 lg:pr-6 lg:py-5",
          ].join(" ")}
        >
          {/* 티어 뱃지 */}
          <div className="mb-2">
            <span
              className="inline-flex h-[24px] items-center rounded-full bg-white px-3 text-body-14-sb leading-[1]"
              style={{ color: planTheme.colorVar }}
            >
              {planTheme.tierLabel}
            </span>
          </div>

          {/* 텍스트 정보 */}
          <div className="flex flex-col gap-2">
            <Text
              variant="subtitle-16-sb"
              mobileVariant="body-14-sb"
              className="leading-tight tracking-[-0.04em] text-white"
            >
              {current.plan.name} 구독중
            </Text>
            <Text
              variant="body-16-m"
              mobileVariant="body-14-m"
              className="leading-tight text-white/80"
            >
              결제일 : {billingDayLabel(current.nextBillingDate)}
            </Text>
            <Text
              variant="body-16-m"
              mobileVariant="body-14-m"
              className="leading-tight text-white/80"
            >
              결제금액 : {paymentAmount.toLocaleString("ko-KR")}원
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
          position={position}
          total={total}
          onSelectSlot={goToSlot}
          className="absolute bottom-4 left-0 right-0 max-lg:hidden"
        />
      </div>

      {/* 노치 원 + 화살표 버튼 — 데스크톱 전용 (구독 1개일 때 비활성화) */}
      <div
        className="absolute left-0 top-1/2 z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white max-lg:hidden"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={!hasMultiple}
        className="absolute left-0 top-1/2 z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/50 shadow-[2px_2px_4px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40 max-lg:hidden"
        aria-label="이전 구독"
      >
        <PrevArrowIcon />
      </button>

      <div
        className="absolute right-0 top-1/2 z-10 h-12 w-12 translate-x-1/2 -translate-y-1/2 rounded-full bg-white max-lg:hidden"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => step(1)}
        disabled={!hasMultiple}
        className="absolute right-0 top-1/2 z-20 flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 shadow-[2px_2px_4px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40 max-lg:hidden"
        aria-label="다음 구독"
      >
        <NextArrowIcon />
      </button>

      {/* 도트 인디케이터 — 모바일: 카드 외부 하단 */}
      <SubscriptionCarouselIndicator
        position={position}
        total={total}
        onSelectSlot={goToSlot}
        className="pt-3 lg:hidden"
      />
    </div>
  );
}
