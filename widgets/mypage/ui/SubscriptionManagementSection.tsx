"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { Text, useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { cancelSubscription, reactivateSubscription, changePlan } from "@/features/subscription/api/subscriptionApi";
import type { UserSubscriptionDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";

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

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="8" style={{ fill: color }} />
      <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

/* ─────────────────────────────
   Props
───────────────────────────── */
interface Props {
  subscription: UserSubscriptionDto | null;
  plans: SubscriptionPlanDto[];
}

/* ─────────────────────────────
   Main Section
───────────────────────────── */
export default function SubscriptionManagementSection({ subscription, plans }: Props) {
  const router = useRouter();
  const { openModal, openAlert } = useModal();
  const [isPending, startTransition] = useTransition();

  const isCancelled = !subscription?.isActive || subscription?.status === "cancelled";
  const currentTheme = subscription ? packageThemeForPlan(subscription.plan) : null;
  const currentColor = currentTheme?.colorVar ?? "var(--color-basic)";

  /* 결제일 포맷: YYYY-MM-DD → 매달 D일 */
  function formatBillingDay(dateStr: string): string {
    const day = new Date(dateStr).getDate();
    return `매달 ${day}일`;
  }

  /* 구독 시작일 포맷: cancelledAt or nextBillingDate로 역산하기 어려우므로 nextBillingDate 앞달 표시 */
  function formatNextBilling(dateStr: string): string {
    return dateStr.replace(/-/g, ".");
  }

  function handleCancel() {
    if (!subscription) return;
    openModal("subscription-cancel", () => {
      startTransition(async () => {
        try {
          await cancelSubscription(subscription.id);
          router.refresh();
        } catch (err) {
          openAlert({ title: getErrorMessage(err, "구독 해지 처리 중 오류가 발생했습니다.") });
        }
      });
    });
  }

  function handleReactivate(planId?: number) {
    if (!subscription) return;
    openModal("subscription-restart", () => {
      startTransition(async () => {
        try {
          await reactivateSubscription(subscription.id);
          if (planId !== undefined && planId !== subscription.plan.id) {
            await changePlan(subscription.id, { newPlanId: planId });
          }
          router.refresh();
        } catch (err) {
          openAlert({ title: getErrorMessage(err, "구독 재시작 처리 중 오류가 발생했습니다.") });
        }
      });
    });
  }

  function handleChangePlan(plan: SubscriptionPlanDto) {
    if (!subscription) return;
    if (!isCancelled && plan.id === subscription.plan.id) return;
    if (isCancelled) {
      handleReactivate(plan.id);
    } else {
      openModal("subscription-restart", () => {
        startTransition(async () => {
          try {
            await changePlan(subscription.id, { newPlanId: plan.id });
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "플랜 변경 중 오류가 발생했습니다.") });
          }
        });
      });
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white" aria-busy={isPending}>
        {/* Upper band */}
        <div style={{ background: "var(--color-surface-peach)" }}>
          <div className="mx-auto max-w-content max-md:px-4 md:px-0 pb-8 pt-6 md:pt-10">
            {/* Back button */}
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-1 text-subtitle-20-b text-[var(--color-text)] hover:opacity-70"
            >
              <ChevronLeftIcon />
              구독관리
            </button>

            {/* Current subscription card */}
            <div className="flex flex-col gap-4 rounded-[20px] bg-white max-md:p-5 md:flex-row md:items-center md:justify-between md:px-10 md:py-6">
              <div className="flex items-center gap-10">
                {/* Package image */}
                <div className="relative max-md:h-[72px] max-md:w-[100px] md:h-[98px] md:w-[134px] shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={mockTempPackage}
                    alt="패키지 이미지"
                    fill
                    className="object-cover object-center"
                  />
                </div>

                {/* Info column */}
                <div className="flex flex-col gap-2">
                  <span
                    className="inline-flex w-fit items-center rounded-full px-3 py-1 text-body-14-sb text-white"
                    style={{ background: currentColor }}
                  >
                    {isCancelled
                      ? "구독 취소됨"
                      : subscription
                        ? currentTheme!.tierLabelKo
                        : "구독중"}
                  </span>
                  <Text variant="subtitle-16-sb" className="text-[var(--color-text)]">
                    {isCancelled
                      ? (subscription?.plan.name ?? "패키지")
                      : `${subscription?.plan.name ?? ""} 구독중`}
                  </Text>
                  {!isCancelled && subscription && (
                    <>
                      <Text variant="body-16-m" className="text-[var(--color-text-label)]">
                        결제일 : {formatBillingDay(subscription.nextBillingDate)}
                      </Text>
                      <Text variant="body-16-m" className="text-[var(--color-text-label)]">
                        다음 결제일 : {formatNextBilling(subscription.nextBillingDate)}
                      </Text>
                    </>
                  )}
                  {isCancelled && (
                    <Text variant="body-16-m" className="text-[var(--color-text-label)]">
                      구독이 취소되었습니다.
                    </Text>
                  )}
                  {!subscription && (
                    <Text variant="body-16-m" className="text-[var(--color-text-label)]">
                      현재 활성 구독이 없습니다.
                    </Text>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {subscription && !isCancelled && (
                <div className="flex gap-2 md:shrink-0">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex h-[36px] flex-1 items-center justify-center rounded-full px-5 text-body-14-sb text-white transition-opacity hover:opacity-80 disabled:opacity-60 md:flex-none"
                    style={{ background: "var(--color-text-muted)" }}
                  >
                    구독 취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("subscription-plans");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex h-[36px] flex-1 items-center justify-center rounded-full px-5 text-body-14-sb text-white transition-opacity hover:opacity-90 md:flex-none"
                    style={{ background: "var(--color-accent)" }}
                  >
                    구독 변경
                  </button>
                </div>
              )}
              {subscription && isCancelled && (
                <button
                  type="button"
                  onClick={() => handleReactivate()}
                  disabled={isPending}
                  className="flex h-[36px] flex-1 items-center justify-center rounded-full px-5 text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60 md:flex-none"
                  style={{ background: "var(--color-accent)" }}
                >
                  구독 재시작
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Plans section */}
        <div id="subscription-plans" className="mx-auto max-w-content max-md:px-4 md:px-0 py-10">
          <Text as="h2" variant="subtitle-18-b" className="mb-6 text-[var(--color-text)]">
            구독 추가하기
          </Text>

          {plans.length === 0 ? (
            <p className="text-body-14-m text-[var(--color-text-label)]">
              플랜 정보를 불러올 수 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-5">
              {plans.map((plan) => {
                const theme = packageThemeForPlan(plan);
                const color = theme.colorVar;
                const isCurrentPlan = !isCancelled && subscription?.plan.id === plan.id;
                const items = plan.description
                  ? plan.description.split("|").map((s) => s.trim())
                  : [];

                return (
                  <div
                    key={plan.id}
                    className="flex flex-col rounded-[20px] px-6 pb-7 pt-5 shadow-sm"
                    style={{
                      background: "var(--color-background)",
                      ...(isCurrentPlan ? { boxShadow: `0 0 0 2px ${color}` } : {}),
                    }}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-full px-4 py-1 text-body-14-sb leading-[1] text-white"
                          style={{ background: color }}
                        >
                          {theme.tierLabelKo}
                        </span>
                        {isCurrentPlan && (
                          <span
                            className="text-price-16-b"
                            style={{ color }}
                          >
                            이용중
                          </span>
                        )}
                      </div>
                      <button aria-label={`${plan.name} 패키지 상세 정보`} className="flex items-center justify-center">
                        <InfoIcon />
                      </button>
                    </div>

                    <div className="mb-6 flex justify-center">
                      <Image
                        src={mockTempPackage}
                        alt={`${plan.name} 이미지`}
                        className="h-[140px] w-auto object-contain md:h-[120px]"
                      />
                    </div>

                    <Text
                      as="h3"
                      variant="subtitle-18-b"
                      mobileVariant="subtitle-18-b"
                      className="mb-4 text-[var(--color-text)]"
                    >
                      {plan.name} 패키지 BOX
                    </Text>

                    {items.length > 0 && (
                      <ul className="mb-6 flex flex-col gap-3">
                        {items.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-body-14-m leading-[1] text-[var(--color-text)]"
                          >
                            <CheckIcon color={color} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mb-5 mt-auto flex items-center justify-between border-t border-[var(--color-divider-warm)] pt-5">
                      <span className="text-body-14-b text-[var(--color-text)]">
                        월 요금제
                      </span>
                      <span className="text-price-20-eb text-[var(--color-text)]">
                        {plan.monthlyPrice.toLocaleString("ko-KR")}원
                      </span>
                    </div>

                    {isCurrentPlan ? (
                      <div
                        className="flex h-[52px] w-full items-center justify-center rounded-full text-subtitle-16-sb text-white opacity-70"
                        style={{ background: color }}
                      >
                        현재 구독중
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleChangePlan(plan)}
                        disabled={isPending}
                        className="flex h-[52px] w-full items-center justify-center rounded-full text-subtitle-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
                        style={{ background: color }}
                      >
                        {isCancelled ? "구독하기" : "플랜 변경"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
