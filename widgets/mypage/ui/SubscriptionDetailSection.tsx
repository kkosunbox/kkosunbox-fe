"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text, useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import {
  cancelPayment,
  cancelSubscription,
  getPaymentReceipt,
  pauseSubscription,
  resumeSubscription,
} from "@/features/subscription/api/subscriptionApi";
import { TIER_THUMBNAILS } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { packageThemeForPlan } from "@/widgets/subscribe/plans/ui/packageData";
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
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center max-md:justify-center md:justify-end gap-2 pt-6" aria-label="결제내역 페이지 탐색">
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

  const theme = packageThemeForPlan(subscription.plan);
  const startDate = deriveStartDate(payments, subscription.nextBillingDate);

  const totalPages = Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const records = payments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function handleCancel() {
    openModal("subscription-cancel", () => {
      showLoading("구독 해지를 처리하고 있습니다...");
      startTransition(async () => {
        try {
          await cancelSubscription(subscription.id);
          router.push("/mypage/subscription");
          router.refresh();
        } catch (err) {
          openAlert({ title: getErrorMessage(err, "구독 해지 처리 중 오류가 발생했습니다.") });
        } finally {
          hideLoading();
        }
      });
    });
  }

  function handleTogglePause() {
    const isPaused = subscription.isPaused;
    openAlert({
      title: isPaused
        ? "구독 쉬어가기를 해제할까요?"
        : "이번 달 결제를 쉬어가시겠어요?",
      description: isPaused
        ? "다음 결제일에 정상적으로 결제됩니다."
        : "이번 결제일은 결제 없이 건너뛰며,\n다음 결제일로 자동 갱신됩니다.",
      primaryLabel: isPaused ? "쉬어가기 해제" : "쉬어가기",
      secondaryLabel: "다음에 할게요",
      onPrimary: () => {
        showLoading(
          isPaused
            ? "쉬어가기를 해제하고 있습니다..."
            : "쉬어가기를 적용하고 있습니다...",
        );
        startTransition(async () => {
          try {
            if (isPaused) {
              await resumeSubscription(subscription.id);
            } else {
              await pauseSubscription(subscription.id);
            }
            router.refresh();
          } catch (err) {
            openAlert({
              title: getErrorMessage(
                err,
                isPaused
                  ? "쉬어가기 해제 처리 중 오류가 발생했습니다."
                  : "쉬어가기 처리 중 오류가 발생했습니다.",
              ),
            });
          } finally {
            hideLoading();
          }
        });
      },
    });
  }

  function handleCancelPayment(paymentId: number) {
    openAlert({
      title: "이 결제 건을 취소하시겠어요?",
      description:
        "결제 완료 후 배송 전 상태에서만 취소할 수 있으며,\n취소 시 결제 금액이 환불됩니다.",
      primaryLabel: "결제 취소",
      secondaryLabel: "다음에 할게요",
      onPrimary: () => {
        showLoading("결제를 취소하고 있습니다...");
        startTransition(async () => {
          try {
            await cancelPayment(paymentId);
            router.refresh();
          } catch (err) {
            openAlert({
              title: getErrorMessage(err, "결제 취소 처리 중 오류가 발생했습니다."),
            });
          } finally {
            hideLoading();
          }
        });
      },
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

  /* Figma: 949px content × header 44px + row 49px each. Columns at 30/497/627/779 within bar.
     Translated to grid: [name+chip+link / 금액 / 날짜 / 영수증] with header inset matching. */
  const ROW_GRID =
    "grid grid-cols-[1fr_130px_152px_140px] items-center";
  const ROW_HEIGHT = "h-[49px]";

  function RecordRow({ record, desktop }: { record: SubscriptionPaymentDto; desktop: boolean }) {
    const displayStatus = toDisplayStatus(record.status);
    const dateStr = formatDate(record.approvedAt ?? record.createdAt);
    const pkgName = record.planName ?? subscription.plan.name;

    const canCancelPayment = record.status === "completed";

    if (!desktop) {
      return (
        <li className="border-b border-[var(--color-text-muted)] last:border-b-0">
          <div className="py-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-body-14-m text-[var(--color-text)]">{pkgName}</span>
              <StatusBadge status={displayStatus} />
              {displayStatus === "예정" && (
                <Link
                  href="/mypage/subscription/change"
                  className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
                >
                  플랜 변경하기
                </Link>
              )}
              {canCancelPayment && (
                <button
                  type="button"
                  onClick={() => handleCancelPayment(record.id)}
                  className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
                >
                  결제 취소
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
              <span className="text-body-14-m text-[var(--color-text)]">{formatPrice(record.amount)}</span>
              <span className="text-body-14-m text-[var(--color-text)]">{dateStr}</span>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li className="border-b border-[var(--color-text-muted)] last:border-b-0">
        <div className={`${ROW_GRID} ${ROW_HEIGHT} pl-[30px] pr-2`}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-body-14-m text-[var(--color-text)] truncate">{pkgName}</span>
            <StatusBadge status={displayStatus} />
            {displayStatus === "예정" && (
              <Link
                href="/mypage/subscription/change"
                className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
              >
                플랜 변경하기
              </Link>
            )}
            {canCancelPayment && (
              <button
                type="button"
                onClick={() => handleCancelPayment(record.id)}
                className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
              >
                결제 취소
              </button>
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
    <div className="min-h-screen bg-[var(--color-support-faq-surface)]">
      <div className="mx-auto max-w-content max-md:px-4 md:px-0 pt-6 md:pt-10 pb-12">
        {/* Back + title */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-subtitle-20-b text-[var(--color-text)] hover:opacity-70"
        >
          <ChevronLeftIcon />
          구독중인 플랜
        </button>

        {/* Plan summary card */}
        <div className="flex items-stretch overflow-hidden rounded-[20px] bg-white">
          <div className="relative w-[120px] shrink-0 self-stretch bg-[var(--color-background)] md:h-[180px] md:w-[180px] md:self-auto">
            <Image
              src={TIER_THUMBNAILS[theme.tier]}
              alt={`${subscription.plan.name} 이미지`}
              fill
              className="object-cover object-center"
            />
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4 md:flex-row md:items-center md:gap-6 md:p-8">
            <div className="flex min-w-0 flex-1 flex-col">
              <span
                className="mb-2 inline-flex w-fit items-center rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white md:mb-3"
                style={{ background: theme.colorVar }}
              >
                {theme.tierLabel}
              </span>

              <Text variant="subtitle-18-b" mobileVariant="body-14-sb" className="mb-1 text-[var(--color-text)] md:mb-2">
                {subscription.plan.name} 구독중
              </Text>

              <Text variant="body-14-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                {formatDate(startDate)} ~
              </Text>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <Text variant="body-14-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                  결제일 : {billingDayLabel(subscription.nextBillingDate)}
                </Text>
                {subscription.isPaused && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-btn-12-m bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]">
                    쉬어가는 중
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="max-md:text-body-13-m md:text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
                >
                  {subscription.isPaused ? "쉬어가기 해제" : "구독 쉬어가기"}
                </button>
              </div>
            </div>

            {/* Desktop-only action buttons (inside card, right side) */}
            <div className="max-md:hidden flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[var(--color-ui-disabled)] px-6 text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                구독 취소
              </button>
              <Link
                href="/mypage/subscription/change"
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[var(--color-accent)] px-6 text-body-14-sb text-white transition-opacity hover:opacity-90"
              >
                구독 변경
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile-only action buttons (below card, full-width split) */}
        <div className="md:hidden mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-[44px] items-center justify-center rounded-full bg-[var(--color-ui-disabled)] text-body-14-sb text-white transition-opacity hover:opacity-90"
          >
            구독 취소
          </button>
          <Link
            href="/mypage/subscription/change"
            className="flex h-[44px] items-center justify-center rounded-full bg-[var(--color-accent)] text-body-14-sb text-white transition-opacity hover:opacity-90"
          >
            구독 변경
          </Link>
        </div>

        {/* Payment history card — Figma Group 1000005367 */}
        <div className="mt-8 rounded-[20px] bg-white max-md:p-5 md:p-8">
          {/* Desktop table */}
          <div className="max-md:hidden">
            <div className={`${ROW_GRID} h-11 rounded-lg bg-[var(--color-surface-light)] pl-[30px] pr-2`}>
              <span className="text-body-16-m text-[var(--color-text-tertiary)]">구독</span>
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
                <ul className="mt-2">
                  {records.map((record) => (
                    <RecordRow key={record.id} record={record} desktop />
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
          <div className="md:hidden">
            {payments.length === 0 ? (
              <p className="py-12 text-center text-body-14-m text-[var(--color-text-label)]">
                결제 내역이 없습니다.
              </p>
            ) : (
              <>
                <ul>
                  {records.map((record) => (
                    <RecordRow key={record.id} record={record} desktop={false} />
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
    </div>
  );
}
