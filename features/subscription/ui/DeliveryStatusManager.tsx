"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPaymentHistory, cancelPayment } from "@/features/subscription/api/subscriptionApi";
import { getErrorMessage } from "@/shared/lib/api";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { tierFromSubscriptionPlan } from "@/widgets/subscribe/plans/ui/packageData";
import type { PackageTier } from "@/widgets/subscribe/plans/ui/packageData";
import type {
  SubscriptionPaymentDto,
  DeliveryStatus,
} from "@/features/subscription/api/types";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
function AddressVerifiedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="var(--color-accent)" />
      <path d="M5.33268 8L7.33268 10L10.666 6" stroke="var(--color-accent)" strokeLinecap="round" />
    </svg>
  );
}

/* ── 상수 ─────────────────────────────────────────────────── */

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PendingDelivery: "배송준비중",
  DeliveryInProgress: "배송중",
  DeliveryCompleted: "배송완료",
};

const TIER_STYLE: Record<PackageTier, string> = {
  Premium: "bg-[var(--color-accent-orange)] text-white",
  Standard: "bg-[var(--color-plus)] text-white",
  Basic: "bg-[var(--color-basic)] text-white",
};

const EPOST_TRACKING_BASE =
  "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm";

/* ── 헬퍼 ─────────────────────────────────────────────────── */

function formatDate(dateStr: string): string {
  return dateStr.slice(0, 10).replace(/-/g, ".");
}

function tierFromPlanName(planName: string | undefined): PackageTier {
  return tierFromSubscriptionPlan({ id: 0, name: planName ?? "", sortOrder: 0 });
}

/* ── 아이콘 ──────────────────────────────────────────────── */

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronNavIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      {dir === "left" ? (
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/* ── 페이지네이션 ─────────────────────────────────────────── */

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
    <nav className="flex items-center justify-center gap-2 pt-4 pb-2" aria-label="배송 현황 페이지 탐색">
      <button
        onClick={onPrev}
        disabled={page === 1}
        aria-label="이전 페이지"
        className="flex h-5 w-5 items-center justify-center text-[var(--color-ui-disabled)] disabled:opacity-40"
      >
        <ChevronNavIcon dir="left" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          aria-current={page === p ? "page" : undefined}
          className={[
            "flex h-5 w-5 items-center justify-center rounded-full text-body-13-r",
            page === p
              ? "font-semibold text-[var(--color-text)]"
              : "text-[var(--color-text-tertiary)]",
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
        <ChevronNavIcon dir="right" />
      </button>
    </nav>
  );
}

/* ── 배송 항목 카드 ───────────────────────────────────────── */

function DeliveryItemCard({
  payment,
  deliveryStatus,
  deliveryAddress,
  onCancelRequest,
}: {
  payment: SubscriptionPaymentDto;
  deliveryStatus: DeliveryStatus;
  deliveryAddress: DeliveryAddress | null;
  onCancelRequest: (paymentId: number) => void;
}) {
  const tier = tierFromPlanName(payment.planName);
  const planLabel = payment.planName ?? "패키지";
  const orderDate = formatDate(payment.createdAt);

  function handleTrack() {
    if (!payment.trackingNumber) return;
    window.open(
      `${EPOST_TRACKING_BASE}?sid1=${encodeURIComponent(payment.trackingNumber)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const addressMain = deliveryAddress
    ? [deliveryAddress.address, deliveryAddress.addressDetail].filter(Boolean).join(" ")
    : null;

  return (
    <div className="rounded-2xl bg-white px-5 py-5">
      {/* 티어 뱃지 */}
      <span
        className={[
          "inline-flex w-fit items-center rounded-full px-3 py-0.5 text-btn-12-m",
          TIER_STYLE[tier],
        ].join(" ")}
      >
        {tier}
      </span>

      {/* 패키지 정보 + 버튼 */}
      <div className="flex items-start justify-between gap-3 mt-1.5">
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-body-16-sb text-[var(--color-text)]">{planLabel}</p>
          <p className="text-body-13-r text-[var(--color-text-secondary)]">
            주문접수 : {orderDate}
          </p>
          <p className="text-body-13-r text-[var(--color-text-secondary)]">
            송장번호 : {payment.trackingNumber ?? "-"}
          </p>
        </div>

        <div className="shrink-0">
          {deliveryStatus === "PendingDelivery" ? (
            <button
              type="button"
              onClick={() => onCancelRequest(payment.id)}
              className="inline-flex h-[32px] items-center rounded-[8px] border border-[var(--color-accent)] px-3 text-body-13-m text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
            >
              주문취소
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTrack}
              disabled={!payment.trackingNumber}
              className="inline-flex h-[32px] items-center rounded-[8px] bg-[var(--color-accent)] px-3 text-body-13-m text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              배송추적
            </button>
          )}
        </div>
      </div>

      {deliveryAddress && (
        <>
          <hr className="my-3 border-[var(--color-text-muted)]" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-body-14-sb text-[var(--color-text)]">
                {deliveryAddress.receiverName}
              </span>
              <AddressVerifiedIcon />
            </div>
            <p className="text-body-13-r text-[var(--color-text-secondary)]">
              {deliveryAddress.phoneNumber}
            </p>
            <p className="text-body-13-r text-[var(--color-text-secondary)]">
              {addressMain}
            </p>
            <p className="text-body-13-r text-[var(--color-text-secondary)]">
              ({deliveryAddress.zipCode})
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Props ───────────────────────────────────────────────── */

interface Props {
  initialPayments: SubscriptionPaymentDto[];
  initialTotal: number;
  deliveryStatus: DeliveryStatus;
  pageLimit: number;
  deliveryAddress: DeliveryAddress | null;
}

/* ── 메인 컴포넌트 ───────────────────────────────────────── */

export function DeliveryStatusManager({
  initialPayments,
  initialTotal,
  deliveryStatus,
  pageLimit,
  deliveryAddress,
}: Props) {
  const router = useRouter();
  const { openModal, openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [payments, setPayments] = useState(initialPayments);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isLoading, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageLimit));
  const title = STATUS_LABEL[deliveryStatus];

  const loadPage = useCallback(
    async (nextPage: number) => {
      try {
        const data = await getPaymentHistory({
          deliveryStatus,
          page: nextPage,
          limit: pageLimit,
        });
        setPayments(data.payments);
        setTotal(data.total);
        setPage(nextPage);
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg(getErrorMessage(err, "목록을 불러오지 못했습니다. 다시 시도해 주세요."));
      }
    },
    [deliveryStatus, pageLimit],
  );

  function handlePageChange(nextPage: number) {
    startTransition(() => {
      loadPage(nextPage);
    });
  }

  function handleCancelRequest(paymentId: number) {
    setErrorMsg(null);
    openModal(
      "payment-cancel",
      () => {
        showLoading("결제를 취소하고 있습니다...");
        startTransition(async () => {
          try {
            await cancelPayment(paymentId);
            await loadPage(page);
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
          {title}
        </h1>
        <button
          type="button"
          onClick={() => window.close()}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* 에러 메시지 */}
      {errorMsg && (
        <p className="mx-5 mb-3 rounded-lg bg-red-50 px-4 py-2 text-body-13-r text-red-500">
          {errorMsg}
        </p>
      )}

      {/* 목록 */}
      <div className="flex flex-col gap-3 px-4 pb-4 flex-1">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <span className="text-body-14-m text-[var(--color-text-label)]">불러오는 중...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <p className="text-body-14-m text-[var(--color-text-label)]">
              {title} 건이 없습니다.
            </p>
          </div>
        ) : (
          payments.map((payment) => (
            <DeliveryItemCard
              key={payment.id}
              payment={payment}
              deliveryStatus={deliveryStatus}
              deliveryAddress={deliveryAddress}
              onCancelRequest={handleCancelRequest}
            />
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {!isLoading && payments.length > 0 && (
        <div className="px-4 pb-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => handlePageChange(page - 1)}
            onNext={() => handlePageChange(page + 1)}
            onSelect={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
