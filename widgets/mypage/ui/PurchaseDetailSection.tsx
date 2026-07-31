"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Text, useModal, useLoadingOverlay } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { TIER_BOX_IMAGES, CURRENT_PURCHASE_TIER, type PackageTier } from "@/entities/package";
import { cancelProductOrder, getProductOrderReceipt } from "@/features/product/api/productApi";
import type { ProductDto, ProductOrderDto, ProductOrderPlanSummaryDto } from "@/features/product/api/types";
import type { ProductPurchaseGroup } from "@/features/product/lib/groupOrdersByProduct";

/* ── 상수 ────────────────────────────────────────────────── */
type DisplayStatus = "예정" | "완료" | "실패" | "환불";

function toDisplayStatus(status: ProductOrderDto["status"]): DisplayStatus {
  if (status === "pending") return "예정";
  if (status === "completed") return "완료";
  if (status === "refunded" || status === "partially_refunded") return "환불";
  return "실패";
}

const DELIVERY_STATUS_LABEL: Record<NonNullable<ProductOrderDto["deliveryStatus"]>, string> = {
  PendingDelivery: "상품준비중",
  DeliveryInProgress: "배송중",
  DeliveryCompleted: "배송완료",
};

function canCancel(order: ProductOrderDto): boolean {
  return order.status === "completed" && order.deliveryStatus !== "DeliveryCompleted";
}

function formatDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, ".");
}

/** 가장 이른 완료 주문일 (없으면 최초 주문일) — 히어로 카드의 "구매일" */
function firstPurchaseDate(orders: ProductOrderDto[]): string | null {
  const completed = orders
    .filter((o) => o.status === "completed" && (o.approvedAt ?? o.createdAt))
    .map((o) => (o.approvedAt ?? o.createdAt))
    .sort();
  return completed[0] ? formatDate(completed[0]) : orders[0] ? formatDate(orders[0].createdAt) : null;
}

const ITEMS_PER_PAGE = 5;

/* ── 아이콘 ──────────────────────────────────────────────── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 16L7 10l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H16M15 11L12 14M12 14L9 11M12 14L12 4"
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

/* ── 상태 뱃지 ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: DisplayStatus }) {
  if (status === "예정") {
    return (
      <span className="inline-flex items-center rounded-full px-3 py-0.5 text-btn-12-m bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]">
        예정
      </span>
    );
  }
  if (status === "실패") {
    return (
      <span className="inline-flex items-center rounded-full px-3 py-0.5 text-btn-12-m bg-red-50 text-red-500">
        실패
      </span>
    );
  }
  if (status === "환불") {
    return (
      <span className="inline-flex items-center rounded-full px-3 py-0.5 text-btn-12-m bg-[var(--color-text-muted)] text-[var(--color-text-secondary)]">
        환불
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-3 py-0.5 text-btn-12-m bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]">
      완료
    </span>
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
    <nav className="flex items-center justify-center gap-2 pt-6" aria-label="구매내역 페이지 탐색">
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
            page === p ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-text-tertiary)]",
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

/* ── Props ───────────────────────────────────────────────── */
interface Props {
  group: ProductPurchaseGroup;
  product: ProductDto | null;
  orders: ProductOrderDto[];
  planSummaries: ProductOrderPlanSummaryDto[];
  /** relatedPlanId로 역매핑된 실제 구매 티어. 매칭 실패 시 null(썸네일은 기본 티어로 폴백) */
  tier: PackageTier | null;
}

/* ── 메인 컴포넌트 ───────────────────────────────────────── */
export default function PurchaseDetailSection({ group, product, orders, planSummaries, tier }: Props) {
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const records = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const paginationProps = {
    page: currentPage,
    totalPages,
    onPrev: () => setPage((p) => Math.max(1, p - 1)),
    onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
    onSelect: setPage,
  };

  const purchaseDate = firstPurchaseDate(orders);

  // 리뷰는 상품에 연결된 구독 플랜(relatedPlanId) 기준으로 구독 리뷰 시스템을 그대로 재사용한다.
  const relatedPlanId = product?.relatedPlanId ?? null;
  const planSummary = relatedPlanId !== null ? planSummaries.find((s) => s.planId === relatedPlanId) : undefined;
  const canReview = planSummary?.canReview ?? false;
  const myReviewId = planSummary?.hasReview ? planSummary.reviewId ?? null : null;

  function handleUnavailableReviewClick() {
    openAlert({
      type: "info",
      title: "아직 리뷰를 작성할 수 없어요.",
      description: "배송이 완료된 이후에 리뷰를 작성하실 수 있습니다.",
    });
  }

  function handleReceiptDownload(orderId: number) {
    startTransition(async () => {
      try {
        const data = await getProductOrderReceipt(orderId);
        window.open(data.receiptUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "영수증을 불러올 수 없습니다.") });
      }
    });
  }

  function handleCancelOrder(orderId: number) {
    openAlert({
      type: "info",
      title: "주문을 환불할까요?",
      description: "결제 완료 후 배송 전 상태의 주문만 환불할 수 있습니다.",
      primaryLabel: "환불",
      secondaryLabel: "닫기",
      onPrimary: () => {
        showLoading("주문을 환불하고 있습니다...");
        startTransition(async () => {
          try {
            await cancelProductOrder(orderId);
            window.location.reload();
          } catch (err) {
            openAlert({ title: getErrorMessage(err, "환불 처리 중 오류가 발생했습니다.") });
          } finally {
            hideLoading();
          }
        });
      },
    });
  }

  function ReviewButton({ className }: { className: string }) {
    if (relatedPlanId === null) return null;
    if (myReviewId !== null) {
      return (
        <Link href={`/mypage/review/write?planId=${relatedPlanId}&reviewId=${myReviewId}`} className={className}>
          리뷰쓰기
        </Link>
      );
    }
    if (canReview) {
      return (
        <Link href={`/mypage/review/write?planId=${relatedPlanId}`} className={className}>
          리뷰쓰기
        </Link>
      );
    }
    return (
      <button type="button" onClick={handleUnavailableReviewClick} className={`${className} opacity-50`}>
        리뷰쓰기
      </button>
    );
  }

  /* ── 구매내역 행 렌더 (공통) ─────────────────────────── */
  function RecordRow({ record, desktop }: { record: ProductOrderDto; desktop: boolean }) {
    const displayStatus = toDisplayStatus(record.status);
    const dateStr = formatDate(record.approvedAt ?? record.createdAt);
    const deliveryLabel = record.deliveryStatus ? DELIVERY_STATUS_LABEL[record.deliveryStatus] : null;

    if (!desktop) {
      return (
        <li className="border-b border-[var(--color-text-muted)] last:border-b-0">
          <div className="py-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-body-14-m text-[var(--color-text)]">{record.productName}</span>
              <StatusBadge status={displayStatus} />
              {canCancel(record) && (
                <button
                  type="button"
                  onClick={() => handleCancelOrder(record.id)}
                  className="text-body-14-m text-[var(--color-accent)] underline"
                >
                  환불하기
                </button>
              )}
              <button
                type="button"
                aria-label={`${dateStr} 영수증 다운로드`}
                onClick={() => handleReceiptDownload(record.id)}
                className="ml-auto hover:opacity-70 transition-opacity"
              >
                <ShareIcon />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-14-m text-[var(--color-text)]">
                {record.amount.toLocaleString("ko-KR")}원 · {record.quantity}개
              </span>
              <span className="text-body-14-m text-[var(--color-text-tertiary)]">{deliveryLabel ?? dateStr}</span>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li className="border-b border-[var(--color-text-muted)] last:border-b-0">
        <div className="grid grid-cols-[1fr_100px_90px_130px_56px] items-center px-8 py-[14px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-14-m text-[var(--color-text)]">{record.productName}</span>
            {canCancel(record) && (
              <button
                type="button"
                onClick={() => handleCancelOrder(record.id)}
                className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80"
              >
                환불하기
              </button>
            )}
          </div>
          <span className="text-body-14-m text-[var(--color-text)]">{deliveryLabel ?? "-"}</span>
          <span className="text-body-14-m text-[var(--color-text)]">
            {record.amount.toLocaleString("ko-KR")}원
          </span>
          <span className="text-body-14-m text-[var(--color-text)]">{dateStr}</span>
          <div className="flex justify-center">
            <button
              type="button"
              aria-label={`${dateStr} 영수증 다운로드`}
              onClick={() => handleReceiptDownload(record.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <ShareIcon />
            </button>
          </div>
        </div>
      </li>
    );
  }

  const boxImage = TIER_BOX_IMAGES[tier ?? CURRENT_PURCHASE_TIER];

  return (
    <div className="relative min-h-screen bg-white pt-[var(--header-offset)]">
      {/* 상단 컬러 밴드 */}
      <div className="absolute left-0 right-0 top-[var(--header-offset)] max-md:h-[296px] md:h-[258px] bg-[var(--color-subscription-detail-header-bg)]" />

      {/* 히어로 — 상품 요약 카드 */}
      <div className="relative mx-auto max-w-content max-md:px-6 md:px-6 lg:px-0 pt-8 pb-6">
        <Link
          href="/mypage"
          className="mb-6 flex items-center gap-1 text-subtitle-18-b text-[var(--color-text)] hover:opacity-70"
        >
          <BackIcon />
          구매관리
        </Link>

        <div className="flex overflow-hidden rounded-[20px] bg-white max-md:h-[150px] md:h-[154px] lg:h-[154px]">
          <div className="relative flex shrink-0 items-center justify-center bg-[var(--color-surface-light)] max-md:h-[150px] max-md:w-[130px] md:h-[154px] lg:h-[154px] md:w-[166px] lg:w-[166px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- 플랜 박스 이미지 원본 품질 유지 */}
            <img
              src={boxImage.src}
              alt={group.productName}
              width={boxImage.width}
              height={boxImage.height}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center scale-105"
            />
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2 p-4 md:flex-row lg:flex-row md:items-center lg:items-center md:gap-6 lg:gap-6 md:px-8 lg:px-8 md:py-5 lg:py-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Text variant="subtitle-16-sb" mobileVariant="body-14-sb" className="tracking-[-0.04em] text-[var(--color-text)]">
                {group.productName}
              </Text>
              {purchaseDate && (
                <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                  {purchaseDate}
                </Text>
              )}
              <Text variant="body-16-m" mobileVariant="body-13-r" className="text-[var(--color-text-label)]">
                단품구매
              </Text>
            </div>

            <ReviewButton className="max-md:hidden inline-flex h-10 w-[102px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-14-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90" />
          </div>
        </div>

        <div className="md:hidden lg:hidden mt-3">
          <ReviewButton className="flex h-[40px] w-full items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-14-sb text-white transition-opacity hover:opacity-90" />
        </div>
      </div>

      {/* 구매내역 */}
      <div className="relative mx-auto max-w-content max-md:px-6 md:px-6 lg:px-0 max-md:pt-6 md:pt-6 pb-12">
        <Text as="h2" variant="subtitle-18-b" className="mb-5 text-[var(--color-text)]">
          구매내역
        </Text>

        {/* 데스크탑 표 */}
        <div className="max-md:hidden">
          <div className="grid grid-cols-[1fr_100px_90px_130px_56px] items-center rounded-lg bg-[var(--color-surface-light)] px-8 py-3">
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">제품명</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">배송</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">금액</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)]">구매일자</span>
            <span className="text-body-16-m text-[var(--color-text-tertiary)] text-center">영수증</span>
          </div>

          {orders.length === 0 ? (
            <p className="py-12 text-center text-body-14-m text-[var(--color-text-label)]">
              구매 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul>
                {records.map((record) => (
                  <RecordRow key={record.id} record={record} desktop={true} />
                ))}
              </ul>
              <Pagination {...paginationProps} />
            </>
          )}
        </div>

        {/* 모바일 리스트 */}
        <div className="md:hidden lg:hidden">
          {orders.length === 0 ? (
            <p className="py-12 text-center text-body-14-m text-[var(--color-text-label)]">
              구매 내역이 없습니다.
            </p>
          ) : (
            <>
              <ul>
                {records.map((record) => (
                  <RecordRow key={record.id} record={record} desktop={false} />
                ))}
              </ul>
              <Pagination {...paginationProps} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
