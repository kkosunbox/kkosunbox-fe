"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChecklistRecommendModal, ScrollReveal, useModal } from "@/shared/ui";
import { TIER_THUMBNAILS } from "./packageThumbnails";
import { useAuth } from "@/features/auth";
import SubscribePlansHeroImage from "@/widgets/subscribe/plans/assets/subscribe-plans-hero.webp";
import SubscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.webp";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  PACKAGES,
} from "./packageData";
import PackageDetailView from "./PackageDetailView";
import MobileTierDetailPanel from "./MobileTierDetailPanel";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";

/** 모바일 sticky 탭 + 고정 헤더의 합산 높이 — scroll offset / scroll-spy rootMargin 에 공통 사용 */
const MOBILE_SCROLL_OFFSET = 120;

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

/* ── Icons ───────────────────────────────────────────────────────── */

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" className="shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="8" style={{ fill: color }} />
      <path
        d="M6 9L8 11L12 7"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="10" stroke="var(--color-icon-muted)" strokeWidth="1.5" fill="none" />
      <path d="M11 10V15" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="7.5" r="1" fill="var(--color-icon-muted)" />
    </svg>
  );
}

/* ── Plan Card ───────────────────────────────────────────────────── */

interface PlanCardProps {
  plan: SubscriptionPlanDto;
  onInfoClick: () => void;
  onPrimaryClick: () => void;
}

function PlanCard({ plan, onInfoClick, onPrimaryClick }: PlanCardProps) {
  const theme = packageThemeForPlan(plan);
  const color = theme.colorVar;
  const pkg = PACKAGES.find((p) => p.tier === theme.tier);

  return (
    <div className="flex h-full flex-col rounded-[20px] bg-[var(--color-background)] px-7 pb-7 pt-5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
            style={{ background: color }}
          >
            {theme.tierLabel}
          </span>
          {plan.isRecommended ? (
            <span className="rounded-full bg-[var(--color-accent-orange)] px-3 py-1 text-body-12-sb text-white">
              추천
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={`${plan.name} 패키지 상세 정보`}
          onClick={onInfoClick}
          className="flex shrink-0 items-center justify-center"
        >
          <InfoIcon />
        </button>
      </div>

      <div className="mb-[56px] flex justify-center">
        <Image
          src={TIER_THUMBNAILS[theme.tier]}
          alt={`${plan.name} 이미지`}
          className="h-[150px] w-auto object-contain"
        />
      </div>

      <h2 className="mb-7.5 text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
        {plan.name}
      </h2>

      {plan.description ? (
        <p className="mb-4 text-body-13-r text-[var(--color-text-secondary)]">
          {plan.description}
        </p>
      ) : null}

      <ul className="mb-7 flex flex-col gap-[14px]">
        {(pkg?.items ?? []).map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-body-13-m leading-[16px] text-black"
          >
            <CheckIcon color={color} />
            {item}
          </li>
        ))}
      </ul>

      <div className="mb-7 mt-auto flex items-center justify-between border-t border-[var(--color-text-muted)] pt-3">
        <span className="text-body-14-b text-black">월 요금제</span>
        <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
          {formatMonthlyPrice(plan.monthlyPrice)}
        </span>
      </div>

      <button
        type="button"
        onClick={onPrimaryClick}
        className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
        style={{ background: color }}
      >
        제품 상세보기
      </button>
    </div>
  );
}

/* ── Main Section ───────────────────────────────────────────────── */

interface Props {
  plans: SubscriptionPlanDto[];
}

export default function SubscribePlansSection({ plans }: Props) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { openAlert } = useModal();
  const [isDismissed, setIsDismissed] = useState(false);
  /** 데스크톱 전용: 그리드 ↔ 단일 상세 뷰 전환 */
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDto | null>(null);
  const [hasOpenedDetail, setHasOpenedDetail] = useState(false);
  /** 모바일 전용: 카드별 독립 토글. 여러 카드 동시 확장 허용 */
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<number>>(new Set());
  /** 모바일 상단 탭 active (scroll-spy로 자동 갱신) — 초기값은 첫 플랜 */
  const [activePlanId, setActivePlanId] = useState<number | null>(() => {
    const sorted = [...plans].sort(comparePlansForDisplayOrder);
    return sorted[0]?.id ?? null;
  });
  /** 각 카드 래퍼 DOM ref — 탭 scrollIntoView & scroll-spy 대상 */
  const cardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  /** 탭 클릭으로 유발된 smooth scroll 중에는 scroll-spy의 active 갱신을 잠시 막음 (중간 카드 지나가며 깜빡이는 현상 방지) */
  const scrollLockRef = useRef(false);
  const scrollIdleTimerRef = useRef<number | undefined>(undefined);
  const scrollLockFailsafeRef = useRef<number | undefined>(undefined);

  const sortedPlans = useMemo(
    () => [...plans].sort(comparePlansForDisplayOrder),
    [plans],
  );

  const handleInfoClick = useCallback((plan: SubscriptionPlanDto) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      // 모바일: 해당 카드 inline 토글
      setExpandedPlanIds((prev) => {
        const next = new Set(prev);
        if (next.has(plan.id)) {
          next.delete(plan.id);
        } else {
          next.add(plan.id);
        }
        return next;
      });
    } else {
      // 데스크톱: 기존 동작 — 그리드를 상세 뷰로 전체 교체
      setHasOpenedDetail(true);
      setSelectedPlan(plan);
    }
  }, []);

  const handleCollapseMobileCard = useCallback((planId: number) => {
    setExpandedPlanIds((prev) => {
      if (!prev.has(planId)) return prev;
      const next = new Set(prev);
      next.delete(planId);
      return next;
    });
  }, []);

  const handleCloseDesktopDetail = useCallback(() => {
    setSelectedPlan(null);
  }, []);

  const handleDesktopSelectPlan = useCallback((plan: SubscriptionPlanDto) => {
    setHasOpenedDetail(true);
    setSelectedPlan(plan);
  }, []);

  const handleTabClick = useCallback((planId: number) => {
    setActivePlanId(planId);
    // scroll-spy를 잠가, 애니메이션 중 중간 카드들에 의해 active 가 깜빡이지 않게 함
    scrollLockRef.current = true;
    if (scrollLockFailsafeRef.current !== undefined) {
      window.clearTimeout(scrollLockFailsafeRef.current);
    }
    // scrollIntoView 가 사실상 no-op 이거나 scroll 이벤트가 안 뜰 경우의 페일세이프
    scrollLockFailsafeRef.current = window.setTimeout(() => {
      scrollLockRef.current = false;
    }, 1200);

    const el = cardRefs.current.get(planId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  /** scroll-idle 기반 lock 해제 — 스크롤 이벤트가 100ms 간 끊기면 애니메이션 종료로 간주 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      if (!scrollLockRef.current) return;
      if (scrollIdleTimerRef.current !== undefined) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
      scrollIdleTimerRef.current = window.setTimeout(() => {
        scrollLockRef.current = false;
      }, 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollIdleTimerRef.current !== undefined) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
      if (scrollLockFailsafeRef.current !== undefined) {
        window.clearTimeout(scrollLockFailsafeRef.current);
      }
    };
  }, []);

  /** 모바일 scroll-spy — 현재 뷰포트 상단 밴드에 걸친 카드를 active 로 표시 */
  useEffect(() => {
    if (typeof window === "undefined" || sortedPlans.length === 0) return;
    const targets = sortedPlans
      .map((p) => cardRefs.current.get(p.id))
      .filter((el): el is HTMLDivElement => !!el);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return; // 탭 클릭 스크롤 애니메이션 중에는 무시
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = Number(visible[0].target.getAttribute("data-plan-id"));
          if (!Number.isNaN(id)) setActivePlanId(id);
        }
      },
      {
        rootMargin: `-${MOBILE_SCROLL_OFFSET}px 0px -60% 0px`,
        threshold: 0,
      },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sortedPlans]);

  const isChecklistDone = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => {
      if (!user) return false;
      return localStorage.getItem(`kkosun_checklist_done_${user.id}`) === "true";
    },
    () => true,
  );
  const showModal = !isChecklistDone && !isDismissed;

  function handleClose() {
    setIsDismissed(true);
  }

  function handleConfirm() {
    setIsDismissed(true);
    if (!isLoggedIn) {
      openAlert({
        title: "로그인이 필요해요",
        description: "체크리스트 작성은 로그인 후 이용할 수 있어요.",
        primaryLabel: "로그인 하러 가기",
        onPrimary: () => router.push("/login?next=/checklist"),
        secondaryLabel: "취소",
      });
      return;
    }
    router.push("/checklist");
  }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <section className="bg-white pb-16 md:pt-0 md:pb-20">
        <div className="mx-auto px-6 md:px-0">
          {/* Hero image */}
          <ScrollReveal variant="fade-in" duration={600}>
            <div className="mb-6 text-center md:mb-8">
              <Image
                src={SubscribePlansHeroImageMobile}
                alt="Subscribe Plans Hero"
                className="max-md:block md:hidden w-[100vw] max-w-none relative left-1/2 -translate-x-1/2"
              />
              <div className="hidden h-[210px] overflow-hidden md:flex md:items-center md:justify-center">
                <Image
                  src={SubscribePlansHeroImage}
                  alt="Subscribe Plans Hero"
                  className="h-[210px] w-auto min-w-[1920px] max-w-none shrink-0"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* 모바일 티어 탭 — sticky (고정 헤더 아래 고정), 클릭 시 해당 카드로 smooth scroll */}
          {sortedPlans.length > 0 ? (
            <div className="md:hidden sticky top-[54px] z-10 -mx-6 bg-white px-6 py-3 mb-4">
              <div className="flex justify-center gap-3">
                {sortedPlans.map((p) => {
                  const theme = packageThemeForPlan(p);
                  const isActive = activePlanId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleTabClick(p.id)}
                      className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white transition-colors"
                      style={{
                        background: isActive ? theme.colorVar : "var(--color-text-muted)",
                      }}
                    >
                      {theme.tierLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ══ Desktop (md+) — 기존 로직 그대로 유지 ══════════════════════ */}
          <div className="max-md:hidden">
            {selectedPlan ? (
              <div className="mx-auto w-full max-w-[var(--max-width-content)]">
                <PackageDetailView
                  plan={selectedPlan}
                  allPlans={sortedPlans}
                  onSelectPlan={handleDesktopSelectPlan}
                  onClose={handleCloseDesktopDetail}
                />
              </div>
            ) : sortedPlans.length === 0 ? (
              <p className="mx-auto max-w-content text-center text-body-16-m text-[var(--color-text-secondary)]">
                표시할 구독 플랜이 없습니다. 잠시 후 다시 시도해 주세요.
              </p>
            ) : (
              <div className="mx-auto max-w-content grid grid-cols-3 gap-4">
                {sortedPlans.map((plan, i) => (
                  <ScrollReveal
                    key={plan.id}
                    variant="fade-up"
                    delay={100 + i * 120}
                    duration={600}
                    immediate={hasOpenedDetail}
                  >
                    <PlanCard
                      plan={plan}
                      onInfoClick={() => handleInfoClick(plan)}
                      onPrimaryClick={() => router.push(`/subscribe/detail?planId=${plan.id}`)}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>

          {/* ══ Mobile (max-md) — 카드 항상 렌더 + 카드별 inline 토글 ══════ */}
          <div className="md:hidden">
            {sortedPlans.length === 0 ? (
              <p className="mx-auto max-w-content text-center text-body-16-m text-[var(--color-text-secondary)]">
                표시할 구독 플랜이 없습니다. 잠시 후 다시 시도해 주세요.
              </p>
            ) : (
              <div className="mx-auto max-w-content flex flex-col gap-4">
                {sortedPlans.map((plan, i) => {
                  const isExpanded = expandedPlanIds.has(plan.id);
                  return (
                    <ScrollReveal
                      key={plan.id}
                      variant="fade-up"
                      delay={100 + i * 120}
                      duration={600}
                    >
                      <div
                        ref={(el) => {
                          cardRefs.current.set(plan.id, el);
                        }}
                        data-plan-id={plan.id}
                        style={{ scrollMarginTop: `${MOBILE_SCROLL_OFFSET}px` }}
                      >
                        {isExpanded ? (
                          <MobileTierDetailPanel
                            plan={plan}
                            onClose={() => handleCollapseMobileCard(plan.id)}
                          />
                        ) : (
                          <PlanCard
                            plan={plan}
                            onInfoClick={() => handleInfoClick(plan)}
                            onPrimaryClick={() => router.push(`/subscribe/detail?planId=${plan.id}`)}
                          />
                        )}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
