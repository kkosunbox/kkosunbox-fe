"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Text, useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { trackSubscriptionCancelAttempt } from "@/shared/lib/analytics";
import {
  cancelPayment,
  cancelSubscription,
  deleteSubscriptionRecord,
  getPaymentReceipt,
  pauseSubscription,
  reactivateSubscription,
  resumeSubscription,
} from "@/features/subscription/api/subscriptionApi";
import { TIER_BOX_IMAGES } from "@/entities/package";
import { packageThemeForPlan } from "@/entities/package";
import type { UserSubscriptionDto, SubscriptionPaymentDto } from "@/features/subscription/api/types";

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

function DownloadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H16M9 11L12 14L15 11M12 14L12 4"
        stroke="var(--color-border)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {dir === "left" ? (
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/* ─────────────────────────────
   Helpers
───────────────────────────── */
function formatDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, ".");
}

function formatPrice(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

const DELIVERY_STATUS_LABEL: Record<string, string> = {
  PendingDelivery: "상품준비중",
  DeliveryInProgress: "배송중",
  DeliveryCompleted: "배송완료",
};

const EPOST_TRACKING_BASE =
  "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm";

function billingDayLabel(dateStr: string): string {
  const day = parseInt(dateStr.slice(8, 10), 10);
  return `매달 ${day}일`;
}

function deriveStartDate(payments: SubscriptionPaymentDto[], fallback: string): string {
  const completed = payments
    .filter((p) => p.status === "completed" && (p.approvedAt ?? p.createdAt))
    .map((p) => (p.approvedAt ?? p.createdAt).slice(0, 10))
    .sort();
  return completed[0] ?? fallback;
}

type DisplayStatus = "예정" | "완료" | "실패" | "환불";
function toDisplayStatus(status: SubscriptionPaymentDto["status"]): DisplayStatus {
  if (status === "pending") return "예정";
  if (status === "completed") return "완료";
  if (status === "refunded" || status === "partially_refunded") return "환불";
  return "실패";
}

const ITEMS_PER_PAGE = 10;

/* ─────────────────────────────
   Status Badge — Figma chip2 spec
───────────────────────────── */
function StatusBadge({ status }: { status: DisplayStatus }) {
  if (status === "예정") {
    return (
      <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)] opacity-80">
        예정
      </span>
    );
  }
  if (status === "실패") {
    return (
      <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-red-50 text-red-500 opacity-80">
        실패
      </span>
    );
  }
  if (status === "환불") {
    return (
      <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-[var(--color-text-muted)] text-[var(--color-text-secondary)] opacity-80">
        환불
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-[var(--color-status-done-bg)] text-[var(--color-status-done)] opacity-80">
      완료
    </span>
  );
}

/* ─────────────────────────────
   Pagination
───────────────────────────── */
function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onSelect,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (p: number) => void;
}) {
  return (
    <nav className="flex items-center justify-center gap-2 pt-6" aria-label="결제내역 페이지 탐색">
      <button
        onClick={onPrev}
        disabled={page === 1}
        aria-label="이전 페이지"
        className="flex h-5 w-5 items-center justify-center text-[var(--color-ui-disabled)] disabled:opacity-40"
      >
        <ChevronIcon dir="left" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          aria-current={page === p ? "page" : undefined}
          className={[
            "flex h-5 w-5 items-center justify-center rounded-full text-body-13-r",
            page === p ? "text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
      <button
        onClick={onNext}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        className="flex h-5 w-5 items-center justify-center text-[var(--color-ui-disabled)] disabled:opacity-40"
      >
        <ChevronIcon dir="right" />
      </button>
    </nav>
  );
}

/* ─────────────────────────────
   Props
───────────────────────────── */
interface Props {
  subscription: UserSubscriptionDto;
  payments: SubscriptionPaymentDto[];
}

/* ─────────────────────────────
   Main Section
───────────────────────────── */
export default function SubscriptionDetailSection({ subscription, payments }: Props) {
  const router = useRouter();
  const { openModal, openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [, startTransition] = useTransition();
  const [page, setPage] = useState(1);

  const isActive = subscription.isActive;
  const theme = packageThemeForPlan(subscription.plan);
  const startDate = deriveStartDate(payments, subscription.nextBillingDate);
  const endDate = subscription.cancelledAt
    ? subscription.cancelledAt.slice(0, 10)
    : subscription.terminatedAt
      ? subscription.terminatedAt.slice(0, 10)
      : null;

  const totalPages = Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const records = payments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function handleDeleteRecord() {
    openAlert({
      type: "info",
      title: "구독 이력을 삭제할까요?",
      description: "삭제하면 해당 구독 정보가 목록에서 제거됩니다.",
      primaryLabel: "삭제",
      secondaryLabel: "취소",
      onPrimary: () => {
        showLoading("구독 이력을 삭제하고 있습니다...");
        startTransition(async () => {
          try {
            await deleteSubscriptionRecord(subscription.id);
            router.push("/mypage/subscription");
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "구독 이력 삭제 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      },
    });
  }

  function handleResubscribe() {
    openModal("subscription-restart", () => {
      showLoading("구독을 재시작하고 있습니다...");
      startTransition(async () => {
        try {
          await reactivateSubscription(subscription.id);
          openAlert({ type: "success", title: "구독이 재시작되었습니다." });
          router.refresh();
        } catch (err) {
          openAlert({ title: getErrorMessage(err, "구독 재시작 처리 중 오류가 발생했습니다.") });
        } finally {
          hideLoading();
        }
      });
    });
  }

  function handleCancel() {
    trackSubscriptionCancelAttempt();
    const hasCancellablePayment = payments.some(
      (p) => p.status === "completed" && p.deliveryStatus !== "DeliveryCompleted",
    );

    const doCancel = (cancelEligiblePayments: boolean) => {
      showLoading("구독 해지를 처리하고 있습니다...");
      startTransition(async () => {
        try {
          await cancelSubscription(subscription.id, cancelEligiblePayments || undefined);
          router.push("/mypage/subscription");
          router.refresh();
        } catch (err) {
          openAlert({ title: getErrorMessage(err, "구독 해지 처리 중 오류가 발생했습니다.") });
        } finally {
          hideLoading();
        }
      });
    };

    if (hasCancellablePayment) {
      openModal(
        "subscription-cancel-with-delivery",
        () => doCancel(false),
        () => doCancel(true),
      );
    } else {
      openModal("subscription-cancel", () => doCancel(false));
    }
  }

  function handleTogglePause() {
    const isPaused = subscription.isPaused;
    if (isPaused) {
      openAlert({
        type: "info",
        title: "구독 쉬어가기를 해제할까요?",
        description: "다음 결제일에 정상적으로 결제됩니다.",
        primaryLabel: "쉬어가기 해제",
        secondaryLabel: "다음에 할게요",
        onPrimary: () => {
          showLoading("쉬어가기를 해제하고 있습니다...");
          startTransition(async () => {
            try {
              await resumeSubscription(subscription.id);
              router.refresh();
            } catch (err) {
              openAlert({ title: getErrorMessage(err, "쉬어가기 해제 처리 중 오류가 발생했습니다.") });
            } finally {
              hideLoading();
            }
          });
        },
      });
    } else {
      openModal("subscription-pause", () => {
        showLoading("쉬어가기를 적용하고 있습니다...");
        startTransition(async () => {
          try {
            await pauseSubscription(subscription.id);
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "쉬어가기 처리 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      });
    }
  }

  function handleCancelPayment(paymentId: number) {
    openModal(
      "payment-cancel",
      () => {
        showLoading("결제를 취소하고 있습니다...");
        startTransition(async () => {
          try {
            await cancelPayment(paymentId);
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "결제 취소 처리 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      },
      () => {
        showLoading("결제 취소 및 구독 해지를 처리하고 있습니다...");
        startTransition(async () => {
          try {
            await cancelPayment(paymentId, { cancelSubscription: true });
            router.push("/mypage/subscription");
            router.refresh();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "처리 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      },
    );
  }

  function handleChangeSubscription() {
    openModal("subscription-change-confirm", () => {
      router.push(`/mypage/subscription/change?subscriptionId=${subscription.id}`);
    });
  }

  function handleReceiptDownload(paymentId: number) {
    startTransition(async () => {
      try {
        const data = await getPaymentReceipt(String(paymentId));
        window.open(data.receiptUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "영수증을 불러올 수 없습니다.") });
      }
    });
  }

  /* lg+(1200px+) 데스크탑은 Figma 원본 컬럼 유지. md~lg 태블릿은 고정 컬럼을 축소해 1fr 셀 확보. */
  const ROW_GRID =
    "grid max-lg:grid-cols-[1fr_120px_130px_152px_72px] lg:grid-cols-[1fr_120px_130px_152px_140px] items-center";
  const ROW_HEIGHT = "h-[49px]";

  function RecordRow({ record, desktop, isOnly }: { record: SubscriptionPaymentDto; desktop: boolean; isOnly?: boolean }) {
    const displayStatus = toDisplayStatus(record.status);
    const dateStr = formatDate(record.approvedAt ?? record.createdAt);
    const pkgName = record.planName ?? subscription.plan.name;

    const canCancelPayment =
      record.status === "completed" &&
      record.deliveryStatus !== "DeliveryCompleted";

    if (!desktop) {
      return (
        <li className={`border-b border-[var(--color-text-muted)] ${isOnly ? "" : "last:border-b-0"}`}>
          <div className="py-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-body-14-m text-[var(--color-text)]">{pkgName}</span>
              <StatusBadge status={displayStatus} />
              {(displayStatus === "예정" || canCancelPayment) && (
                <button
                  type="button"
                  onClick={() => handleCancelPayment(record.id)}
                  className="shrink-0 text-right text-body-13-sb leading-[130%] text-[var(--color-btn-dark-warm)] underline hover:opacity-80"
                >
                  구독취소
                </button>
              )}
              <button
                type="button"
                aria-label={`${dateStr} 영수증 다운로드`}
                onClick={() => handleReceiptDownload(record.id)}
                className="ml-auto hover:opacity-70 transition-opacity"
              >
                <DownloadIcon />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-body-14-m text-[var(--color-text)]">{formatPrice(record.amount)}</span>
                {record.deliveryStatus && (
                  record.trackingNumber ? (
                    <a
                      href={`${EPOST_TRACKING_BASE}?sid1=${encodeURIComponent(record.trackingNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
                    >
                      {DELIVERY_STATUS_LABEL[record.deliveryStatus]}
                    </a>
                  ) : (
                    <span className="text-body-14-m text-[var(--color-text-label)]">
                      {DELIVERY_STATUS_LABEL[record.deliveryStatus]}
                    </span>
                  )
                )}
              </div>
              <span className="text-body-14-m text-[var(--color-text)]">{dateStr}</span>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li className={`border-b border-[var(--color-text-muted)] ${isOnly ? "" : "last:border-b-0"}`}>
        <div className={`${ROW_GRID} ${ROW_HEIGHT} pl-[30px] pr-2`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-body-14-m text-[var(--color-text)] truncate min-w-0">{pkgName}</span>
            <div className="shrink-0 flex items-center gap-2">
              <StatusBadge status={displayStatus} />
              {(displayStatus === "예정" || canCancelPayment) && (
                <button
                  type="button"
                  onClick={() => handleCancelPayment(record.id)}
                  className="shrink-0 text-right text-body-13-sb leading-[130%] text-[var(--color-btn-dark-warm)] underline hover:opacity-80"
                >
                  구독취소
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {record.deliveryStatus ? (
              record.trackingNumber ? (
                <a
                  href={`${EPOST_TRACKING_BASE}?sid1=${encodeURIComponent(record.trackingNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
                >
                  {DELIVERY_STATUS_LABEL[record.deliveryStatus]}
                </a>
              ) : (
                <span className="text-body-14-m text-[var(--color-text-label)]">
                  {DELIVERY_STATUS_LABEL[record.deliveryStatus]}
                </span>
              )
            ) : (
              <span className="text-body-14-m text-[var(--color-text-muted)]">-</span>
            )}
          </div>
          <span className="text-body-14-m text-[var(--color-text)]">{formatPrice(record.amount)}</span>
          <span className="text-body-14-m text-[var(--color-text)]">{dateStr}</span>
          <div className="flex justify-start">
            <button
              type="button"
              aria-label={`${dateStr} 영수증 다운로드`}
              onClick={() => handleReceiptDownload(record.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <DownloadIcon />
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="relative min-h-screen bg-white pt-[var(--header-offset)]">
      {/* Upper solid color band — mobile 367px / desktop 258px */}
      <div className="absolute left-0 right-0 top-0 max-md:h-[296px] md:h-[258px] bg-[var(--color-subscription-header-bg)]" />

      {/* Hero — plan card fits entirely within the 258px band */}
      <div className="relative mx-auto max-w-content max-md:px-6 md:px-6 lg:px-0 pt-8 pb-6">
        {/* Back + title */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-subtitle-18-b text-[var(--color-text)] hover:opacity-70"
        >
          <ChevronLeftIcon />
          구독중인 플랜
        </button>

        {/* Plan summary card — 154px tall, no shadow (colored band provides contrast) */}
        <div className="flex overflow-hidden rounded-[20px] bg-white shadow-[0px_4px_12px_0px_#00000014] max-md:h-[150px] md:h-[154px] lg:h-[154px]">
          <div className="relative shrink-0 bg-[var(--color-surface-light)] max-md:h-[150px] max-md:w-[130px] md:h-[154px] lg:h-[154px] md:w-[166px] lg:w-[166px]">
            <img
              src={TIER_BOX_IMAGES[theme.tier].src}
              alt={`${subscription.plan.name} 이미지`}
              width={TIER_BOX_IMAGES[theme.tier].width}
              height={TIER_BOX_IMAGES[theme.tier].height}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center scale-105"
            />
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2 p-4 md:flex-row lg:flex-row md:items-center lg:items-center md:gap-6 lg:gap-6 md:px-8 lg:px-8 md:py-5 lg:py-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Text variant="subtitle-16-sb" mobileVariant="body-14-sb" className="tracking-[-0.04em] text-[var(--color-text)]">
                {subscription.plan.name}{isActive ? " 구독중" : ""}
              </Text>

              {isActive ? (
                <>
                  <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                    {formatDate(startDate)} ~
                  </Text>
                  <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                    결제일 : {billingDayLabel(subscription.nextBillingDate)}
                  </Text>
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className="shrink-0 self-start text-right text-body-13-sb leading-[130%] text-[var(--color-accent)] underline hover:opacity-80 transition-opacity"
                  >
                    {subscription.isPaused ? "쉬어가기 해제" : "구독 쉬어가기"}
                  </button>
                </>
              ) : (
                <>
                  {endDate && (
                    <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                      {formatDate(endDate)}
                    </Text>
                  )}
                  <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                    구독종료
                  </Text>
                </>
              )}
            </div>

            {/* Desktop-only action buttons */}
            <div className="max-md:hidden flex shrink-0 items-center gap-2">
              {isActive ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex h-8 w-[99px] items-center justify-center rounded-[4px] bg-[var(--color-text-muted)] text-body-14-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
                  >
                    구독 취소
                  </button>
                  <button
                    type="button"
                    onClick={handleChangeSubscription}
                    className="inline-flex h-8 w-[99px] items-center justify-center rounded-[4px] bg-[var(--color-btn-dark-warm)] text-body-14-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
                  >
                    구독 변경
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDeleteRecord}
                    className="inline-flex h-8 w-[99px] items-center justify-center rounded-[4px] bg-[var(--color-text-muted)] text-body-14-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={handleResubscribe}
                    className="inline-flex h-8 w-[99px] items-center justify-center rounded-[4px] bg-[var(--color-btn-dark-warm)] text-body-14-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
                  >
                    구독 재시작
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-only action buttons */}
        <div className="md:hidden lg:hidden mt-3 grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {isActive ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                구독 취소
              </button>
              <button
                type="button"
                onClick={handleChangeSubscription}
                className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                구독 변경
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDeleteRecord}
                className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                삭제
              </button>
              <button
                type="button"
                onClick={handleResubscribe}
                className="flex h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                구독 재시작
              </button>
            </>
          )}
        </div>
      </div>

      {/* Payment history — flat on white background, 24px gap from band end */}
      <div className="relative mx-auto max-w-content max-md:px-6 md:px-6 lg:px-0 max-md:pt-6 md:pt-6 pb-12">
        <Text as="h2" variant="subtitle-18-b" className="mb-5 text-[var(--color-text)]">
          구독 상세내역
        </Text>

        {/* Desktop table */}
        <div className="max-md:hidden">
          <div className={`${ROW_GRID} h-11 rounded-lg bg-[var(--color-surface-light)] pl-[30px] pr-2`}>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">구독</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">배송</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">금액</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">직접입력</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">영수증</span>
          </div>

          {payments.length === 0 ? (
            <p className="py-12 text-center text-body-14-m text-[var(--color-text-label)]">
              결제 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul className="mt-2 min-h-[540px]">
                {records.map((record) => (
                  <RecordRow key={record.id} record={record} desktop isOnly={records.length === 1} />
                ))}
              </ul>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                onSelect={setPage}
              />
            </>
          )}
        </div>

        {/* Mobile list */}
        <div className="md:hidden lg:hidden">
          {payments.length === 0 ? (
            <p className="py-12 text-center text-body-14-m text-[var(--color-text-label)]">
              결제 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul className="min-h-[540px]">
                {records.map((record) => (
                  <RecordRow key={record.id} record={record} desktop={false} isOnly={records.length === 1} />
                ))}
              </ul>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                onSelect={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
