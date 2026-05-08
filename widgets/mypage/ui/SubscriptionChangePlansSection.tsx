"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TIER_THUMBNAILS } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import heroTitleImage from "@/widgets/mypage/assets/subscription-change-plans-selection.webp";
import type { UserSubscriptionDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import { changePlan } from "@/features/subscription/api/subscriptionApi";
import { getErrorMessage } from "@/shared/lib/api";
import { CheckCircleIcon, useLoadingOverlay, useModal } from "@/shared/ui";
import PackageDetailView from "@/widgets/subscribe/plans/ui/PackageDetailView";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  SUBSCRIBE_PLAN_CARD_FEATURES,
} from "@/widgets/subscribe/plans/ui/packageData";

/* ─── Paw decoration (반투명 흰색, 히어로 배경 위 장식) ─── */

function PawDecoration({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="15.5" rx="5" ry="4" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="6.5" cy="10.5" rx="2" ry="2.5" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="10" cy="8.5" rx="2" ry="2.5" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="14" cy="8.5" rx="2" ry="2.5" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="17.5" cy="10.5" rx="2" ry="2.5" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

/* ─── Icons ─── */

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="10" stroke="var(--color-icon-muted)" strokeWidth="1.5" fill="none" />
      <path d="M11 10V15" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="7.5" r="1" fill="var(--color-icon-muted)" />
    </svg>
  );
}

/* ─── Props ─── */

interface Props {
  subscriptions: UserSubscriptionDto[];
  plans: SubscriptionPlanDto[];
  targetSubscriptionId?: number;
}

/* ─── Main ─── */

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function SubscriptionChangePlansSection({ subscriptions, plans, targetSubscriptionId }: Props) {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDto | null>(null);

  const sortedPlans = useMemo(
    () => [...plans].sort(comparePlansForDisplayOrder),
    [plans],
  );

  const isAddMode = !targetSubscriptionId;

  const targetSubscription = useMemo(
    () => subscriptions.find((s) => s.id === targetSubscriptionId) ?? null,
    [subscriptions, targetSubscriptionId],
  );

  // 이미 구독 중인 플랜 여부 — 배지/카드 하이라이트 전용 (버튼 비활성과 무관)
  function hasActiveSub(plan: SubscriptionPlanDto): boolean {
    return subscriptions.some((s) => s.plan.id === plan.id);
  }

  // 버튼 비활성: change 모드에서 교체 대상 플랜만, add 모드는 항상 false
  function isDisabledPlan(plan: SubscriptionPlanDto): boolean {
    if (isAddMode) return false;
    return targetSubscription?.plan.id === plan.id;
  }

  function handlePurchase(plan: SubscriptionPlanDto) {
    // add 모드: 항상 신규 주문 플로우
    if (isAddMode || !targetSubscription) {
      router.push(`/order?planId=${plan.id}&quantity=1`);
      return;
    }

    showLoading("플랜 변경을 처리하고 있습니다...");
    startTransition(async () => {
      try {
        await changePlan(targetSubscription.id, { newPlanId: plan.id });
        openAlert({
          title: "플랜이 변경되었습니다.",
          description: "변경 사항은 다음 결제일에 반영됩니다.",
        });
        router.push("/mypage/subscription");
        router.refresh();
      } catch (err) {
        openAlert({
          title: getErrorMessage(err, "플랜 변경 처리 중 오류가 발생했습니다."),
        });
      } finally {
        hideLoading();
      }
    });
  }

  function buttonLabel(): string {
    if (isAddMode) return "구독하기";
    return subscriptions.length > 0 ? "변경하기" : "구매하기";
  }

  function getDetailPrimaryButton(p: SubscriptionPlanDto) {
    if (isDisabledPlan(p)) {
      return { label: "현재 구독중", onClick: () => {}, disabled: true as const };
    }
    return { label: buttonLabel(), onClick: () => handlePurchase(p), disabled: false };
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden md:h-[210px]" style={{ background: "linear-gradient(268.21deg, rgba(173, 206, 255, 0.5) 3.87%, rgba(254, 234, 215, 0.5) 56.14%)" }}>
        <div className="relative mx-auto max-w-content px-6 md:px-0 flex h-full flex-col items-center justify-center gap-4 py-8 md:py-0">
          {/* 타이틀 이미지 */}
          <h1>
            <Image
              src={heroTitleImage}
              alt={
                subscriptions.length > 0
                  ? "기존 구독을 변경하려면 새로운 구독을 선택하세요."
                  : "원하는 구독 플랜을 선택해서 구독을 시작하세요."
              }
              className="mx-auto w-auto max-w-[240px] md:max-w-[328px]"
              priority
            />
          </h1>

          {/* 체크리스트 하러가기 버튼 */}
          <Link
            href="/checklist"
            className="inline-flex h-[40px] items-center justify-center rounded-full bg-white px-10 text-body-14-sb tracking-[-0.02em] text-[var(--color-text)] shadow-sm transition-opacity hover:opacity-80"
          >
            체크리스트 하러가기
          </Link>
        </div>

        {/* 발바닥 장식 — 우측 */}
        <PawDecoration
          className="absolute max-md:hidden"
          style={{ width: 53, height: 44, right: "calc(50% - 560px)", top: 30, transform: "rotate(12.11deg)" }}
        />
        <PawDecoration
          className="absolute max-md:hidden"
          style={{ width: 84, height: 70, right: "calc(50% - 620px)", top: 100, transform: "rotate(-24.12deg)" }}
        />
      </div>

      {/* Plan cards */}
      <div className="mx-auto max-w-content max-md:px-4 md:px-0 py-10">
        {selectedPlan ? (
          <div className="w-full">
            <PackageDetailView
              key={selectedPlan.id}
              plan={selectedPlan}
              allPlans={sortedPlans}
              onSelectPlan={setSelectedPlan}
              onClose={() => setSelectedPlan(null)}
              getPrimaryButton={getDetailPrimaryButton}
            />
          </div>
        ) : sortedPlans.length === 0 ? (
          <p className="text-body-14-m text-[var(--color-text-label)]">
            플랜 정보를 불러올 수 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-4">
            {sortedPlans.map((plan) => {
              const theme = packageThemeForPlan(plan);
              const color = theme.colorVar;
              const activeSub = hasActiveSub(plan);
              const disabled = isDisabledPlan(plan);

              return (
                <div
                  key={plan.id}
                  className="flex flex-col overflow-hidden rounded-[20px] bg-[var(--color-background)]"
                  style={activeSub ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
                >
                  <div className="relative aspect-[327/252] w-full">
                    <Image
                      src={TIER_THUMBNAILS[theme.tier]}
                      alt={`${plan.name} 이미지`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 px-7 pt-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
                          style={{ background: color }}
                        >
                          {theme.tierLabel}
                        </span>
                        {activeSub ? (
                          <span className="text-price-16-b" style={{ color }}>
                            이용중
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        aria-label={`${plan.name} 패키지 상세 정보`}
                        onClick={() => setSelectedPlan(plan)}
                        className="flex shrink-0 items-center justify-center"
                      >
                        <InfoIcon />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-7 pb-7 pt-5">
                    <h3 className="mb-7.5 text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
                      {plan.name}
                    </h3>

                    {plan.description ? (
                      <p className="mb-4 text-body-13-r text-[var(--color-text-secondary)]">
                        {plan.description}
                      </p>
                    ) : null}

                    <ul className="mb-7 flex flex-col gap-[14px]">
                      {SUBSCRIBE_PLAN_CARD_FEATURES.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-body-13-m leading-[16px] text-black"
                        >
                          <CheckCircleIcon color={color} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mb-7 mt-auto flex items-center justify-between border-t border-white pt-3">
                      <span className="text-body-14-b text-black">월 요금제</span>
                      <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
                        {formatMonthlyPrice(plan.monthlyPrice)}
                      </span>
                    </div>

                    {disabled ? (
                      <div
                        className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white opacity-70"
                        style={{ background: color }}
                      >
                        현재 구독중
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handlePurchase(plan)}
                        className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-70"
                        style={{ background: color }}
                      >
                        {buttonLabel()}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
