"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text, useLoadingOverlay } from "@/shared/ui";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { deleteReview } from "@/features/review/api";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";
import type { PlanReviewEligibility, ReviewResponse } from "@/features/review/api";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { deleteConfirmAlertOptions } from "@/shared/lib/modal/alertPresets";
import { packageThemeForPlan } from "@/entities/package";
import { TIER_BOX_IMAGES } from "@/entities/package";
import MyReviewModal from "./MyReviewModal";

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

interface ReviewState {
  review: ReviewResponse;
  plan: UserSubscriptionDto["plan"];
  isEditable: boolean;
}

export function SubscriptionCard({
  subscriptions,
  eligiblePlans = [],
  myReviews = [],
}: {
  subscriptions: UserSubscriptionDto[];
  eligiblePlans?: PlanReviewEligibility[];
  myReviews?: ReviewResponse[];
}) {
  const total = subscriptions.length;
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [, startTransition] = useTransition();

  // 리뷰 자격·내 리뷰를 plan.id 기준으로 조회 가능하게 맵으로 변환
  const eligibilityByPlan = useMemo(() => {
    const map = new Map<number, PlanReviewEligibility>();
    for (const p of eligiblePlans) map.set(p.planId, p);
    return map;
  }, [eligiblePlans]);

  const reviewByPlan = useMemo(() => {
    const map = new Map<number, ReviewResponse>();
    for (const r of myReviews) map.set(r.planId, r);
    return map;
  }, [myReviews]);

  // planId → plan (리뷰 모달에서 플랜 정보를 조회)
  const planById = useMemo(() => {
    const map = new Map<number, UserSubscriptionDto["plan"]>();
    for (const s of subscriptions) map.set(s.plan.id, s.plan);
    return map;
  }, [subscriptions]);

  // 모달에서 이전/다음으로 순회할 수 있는 내 리뷰 목록
  const reviewStates = useMemo<ReviewState[]>(() => {
    const states: ReviewState[] = [];
    for (const r of myReviews) {
      const plan = planById.get(r.planId);
      if (!plan) continue;
      states.push({
        review: r,
        plan,
        isEditable: eligibilityByPlan.get(r.planId)?.isEditable ?? false,
      });
    }
    return states;
  }, [myReviews, planById, eligibilityByPlan]);

  // "내 리뷰보러가기"로 띄우는 모달 — reviewStates 내 활성 인덱스
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

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
  const boxQuantity = current.quantity > 1 ? current.quantity : null;

  // 현재 카드 플랜의 리뷰 상태 (리뷰는 플랜당 1개 단위)
  const currentPlanId = current.plan.id;
  const eligibility = eligibilityByPlan.get(currentPlanId);
  const myReview = reviewByPlan.get(currentPlanId) ?? null;
  const canReview = eligibility?.canReview ?? false;

  function handleWrittenReviewClick() {
    if (!myReview) return;
    const idx = reviewStates.findIndex((s) => s.review.id === myReview.id);
    if (idx >= 0) setReviewIndex(idx);
  }

  function handleUnavailableReviewClick() {
    openAlert({
      type: "info",
      title: "아직 리뷰를 작성할 수 없어요.",
      description: "배송이 완료된 이후에 리뷰를 작성하실 수 있습니다.",
    });
  }

  const activeReviewState = reviewIndex !== null ? reviewStates[reviewIndex] ?? null : null;
  const canNavigateReviews = reviewStates.length > 1;

  function handleEditReview() {
    if (!activeReviewState) return;
    const { plan, review } = activeReviewState;
    setReviewIndex(null);
    router.push(`/mypage/review/write?planId=${plan.id}&reviewId=${review.id}`);
  }

  function handlePrevReview() {
    setReviewIndex((i) =>
      i === null ? i : wrapIndex(i - 1, reviewStates.length),
    );
  }

  function handleNextReview() {
    setReviewIndex((i) =>
      i === null ? i : wrapIndex(i + 1, reviewStates.length),
    );
  }

  function handleDeleteReview() {
    if (!activeReviewState) return;
    const reviewId = activeReviewState.review.id;
    openAlert(
      deleteConfirmAlertOptions(
        "리뷰를 삭제하시겠습니까?",
        () => {
          setReviewIndex(null);
          showLoading("리뷰를 삭제하고 있습니다...");
          startTransition(async () => {
            try {
              await deleteReview(reviewId);
              openAlert({
                type: "success",
                title: "리뷰가 삭제되었습니다.",
              });
              router.refresh();
            } catch (err) {
              openAlert({
                title: getErrorMessage(
                  err,
                  "리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
                ),
              });
            } finally {
              hideLoading();
            }
          });
        },
        "삭제하면 작성하신 리뷰 내용이 사라집니다.",
      ),
    );
  }

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

  const reviewTheme = activeReviewState ? packageThemeForPlan(activeReviewState.plan) : null;

  return (
    <>
    <div className="relative flex max-lg:h-[144px] flex-col lg:h-[186px]">
      {/* 오렌지 카드 */}
      <div
        className="relative z-0 flex flex-1 rounded-[20px] max-lg:rounded-[16px]"
        style={{ background: planTheme.colorVar }}
        onClickCapture={handleClickCapture}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 좌측 본문 — 텍스트 영역(상세 이동) + 리뷰 버튼 */}
        <div
          className={[
            "relative z-0 flex min-w-0 flex-1 flex-col justify-center",
            "max-lg:px-6 max-lg:pl-10 max-lg:py-4 lg:pl-12 lg:pr-6 lg:py-5",
          ].join(" ")}
        >
          {/* 카드 본문 클릭 — 구독 상세 */}
          <Link
            href={detailHref}
            prefetch={false}
            aria-label={`${current.plan.name} 구독 상세 보기`}
            className="flex flex-col rounded-[8px] outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white"
          >
            {/* 티어 뱃지 */}
            {/* <div className="mb-1.5">
              <span
                className="inline-flex h-[24px] items-center rounded-full bg-white px-3 text-body-14-sb leading-[1]"
                style={{ color: planTheme.colorVar }}
              >
                {planTheme.tierLabel}
              </span>
            </div> */}

            {/* 텍스트 정보 */}
            <div className="flex flex-col max-lg:gap-1 lg:gap-1.5">
              {/* 모바일·태블릿: 뱃지 독립 행 */}
              {boxQuantity !== null && (
                <span className="lg:hidden inline-flex self-start h-[14px] items-center rounded-[4px] bg-white/30 px-1 text-body-12-sb leading-[14px] tracking-[-0.04em] text-white uppercase">
                  {boxQuantity} BOX
                </span>
              )}
              {/* 플랜명 행 — 데스크탑에서는 뱃지도 함께 표시 */}
              <div className="flex flex-wrap items-center gap-[10px]">
                <Text
                  variant="subtitle-16-sb"
                  mobileVariant="body-14-sb"
                  className="max-lg:text-body-14-sb leading-tight tracking-[-0.04em] text-white"
                >
                  {current.plan.name} 구독중
                </Text>
                {boxQuantity !== null && (
                  <span className="max-lg:hidden inline-flex h-[19px] shrink-0 items-center justify-center rounded-[4px] bg-white/30 px-1 text-body-16-sb capitalize leading-[19px] tracking-[-0.04em] text-white">
                    {boxQuantity} BOX
                  </span>
                )}
              </div>
              <Text
                variant="body-16-m"
                mobileVariant="body-13-m"
                className="max-lg:text-body-13-m leading-tight text-white/80"
              >
                결제일 : {billingDayLabel(current.nextBillingDate)}
              </Text>
              <Text
                variant="body-16-m"
                mobileVariant="body-13-m"
                className="max-lg:text-body-13-m leading-tight text-white/80"
              >
                결제금액 : {paymentAmount.toLocaleString("ko-KR")}원
              </Text>
            </div>
          </Link>

          {/* 리뷰 버튼 — 작성됨: 내 리뷰보러가기 / 작성가능: 리뷰쓰러가기 / 미자격: 비활성 */}
          <div className="max-lg:mt-2 lg:mt-2.5">
            {myReview ? (
              <button
                type="button"
                onClick={handleWrittenReviewClick}
                className="inline-flex h-6 items-center rounded-full bg-white px-3 text-body-14-sb leading-[17px] transition-opacity hover:opacity-90"
                style={{ color: planTheme.colorVar }}
              >
                내 리뷰보러가기 →
              </button>
            ) : canReview ? (
              <Link
                href={`/mypage/review/write?planId=${currentPlanId}`}
                prefetch={false}
                className="inline-flex h-6 items-center rounded-full bg-white px-3 text-body-14-sb leading-[17px] transition-opacity hover:opacity-90"
                style={{ color: planTheme.colorVar }}
              >
                리뷰쓰러가기 →
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleUnavailableReviewClick}
                className="inline-flex h-6 items-center rounded-full bg-white/40 px-3 text-body-14-sb leading-[17px] text-white/80 transition-opacity hover:opacity-90"
                aria-label="리뷰쓰러가기 — 배송 완료 후 작성 가능"
              >
                리뷰쓰러가기
              </button>
            )}
          </div>
        </div>

        {/* 구독관리 */}
        <Link
          href="/mypage/subscription"
          prefetch={false}
          className="absolute right-6 top-5 z-10 max-lg:text-body-13-sb lg:text-body-14-sb text-white underline transition-opacity hover:opacity-80"
        >
          구독관리
        </Link>

        {/* 도트 인디케이터 — 카드 하단 (모바일·데스크톱 공통) */}
        <SubscriptionCarouselIndicator
          position={position}
          total={total}
          onSelectSlot={goToSlot}
          className="max-lg:hidden absolute bottom-4 left-0 right-0"
        />
      </div>

      {/* 노치 원 + 화살표 버튼 (구독 1개일 때 비활성화) */}
      <div
        className="absolute left-0 top-1/2 z-10 max-lg:h-8 max-lg:w-8 lg:h-12 lg:w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={!hasMultiple}
        className="absolute left-0 top-1/2 z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/50 shadow-[2px_2px_4px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
        aria-label="이전 구독"
      >
        <PrevArrowIcon />
      </button>

      <div
        className="absolute right-0 top-1/2 z-10 max-lg:h-8 max-lg:w-8 lg:h-12 lg:w-12 translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => step(1)}
        disabled={!hasMultiple}
        className="absolute right-0 top-1/2 z-20 flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 shadow-[2px_2px_4px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
        aria-label="다음 구독"
      >
        <NextArrowIcon />
      </button>

    </div>

      {activeReviewState && reviewTheme && (
        <MyReviewModal
          key={activeReviewState.review.id}
          review={activeReviewState.review}
          planName={activeReviewState.plan.name}
          tierLabel={reviewTheme.tierLabel}
          tierColorVar={reviewTheme.colorVar}
          thumbnail={TIER_BOX_IMAGES[reviewTheme.tier]}
          isEditable={activeReviewState.isEditable}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
          onClose={() => setReviewIndex(null)}
          onPrev={canNavigateReviews ? handlePrevReview : undefined}
          onNext={canNavigateReviews ? handleNextReview : undefined}
        />
      )}
    </>
  );
}
