"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { getPaymentReceipt } from "@/features/subscription/api/subscriptionApi";
import type { BillingInfo } from "@/features/billing/api/types";
import type { UserSubscriptionDto, SubscriptionPaymentDto } from "@/features/subscription/api/types";

/* ── 결제 상태 변환 ────────────────────────────────────────── */
type DisplayStatus = "예정" | "완료" | "실패";

function toDisplayStatus(status: SubscriptionPaymentDto["status"]): DisplayStatus {
  if (status === "pending") return "예정";
  if (status === "completed") return "완료";
  return "실패";
}

const ITEMS_PER_PAGE = 5;

/* ── 공통 스타일 ─────────────────────────────────────────── */
const LABEL_CLS = "text-body-13-m text-[var(--color-text-label)] w-[80px] shrink-0";
const VALUE_CLS = "text-body-13-sb text-[var(--color-text)]";
const UNREGISTERED_CLS =
  "text-[13px] leading-[13px] font-medium tracking-[0] text-[var(--color-text-label)] [font-family:Pretendard,sans-serif]";

/* ── 아이콘 ──────────────────────────────────────────────── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    <nav className="flex items-center justify-center gap-2 pt-4 pb-2" aria-label="결제내역 페이지 탐색">
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
  billingInfo: BillingInfo | null;
  subscription: UserSubscriptionDto | null;
  payments: SubscriptionPaymentDto[];
}

/* ── 메인 컴포넌트 ───────────────────────────────────────── */
export default function PaymentManagementSection({ billingInfo: initialBillingInfo, subscription, payments }: Props) {
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();
  const { openAlert } = useModal();

  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(initialBillingInfo);

  useEffect(() => {
    function handlePaymentMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "PAYMENT_SELECTED" && e.data.billing) {
        setBillingInfo(e.data.billing as BillingInfo);
      }
    }
    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, []);

  function handleOpenPayment() {
    window.open(
      `/payment?method=${encodeURIComponent("신용카드")}`,
      "paymentPopup",
      "width=480,height=700,scrollbars=yes",
    );
  }

  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const records = payments.slice(
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

  /* 카드 표시 */
  const cardDisplay = billingInfo
    ? `${billingInfo.cardCompany} (****-****-****-${billingInfo.lastFourDigits})`
    : "등록된 결제수단 없음";
  const methodDisplay = billingInfo ? "신용카드 결제" : "미등록";
  const simplePaymentDisplay = billingInfo ? cardDisplay : "미등록";

  /* 다음 결제일 */
  const nextDateDisplay = subscription
    ? `${subscription.nextBillingDate.replace(/-/g, ".")} (카드결제)`
    : "-";

  /* 구독 플랜명 */
  const planName = subscription?.plan.name ?? null;

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

  /* ── 결제 내역 행 렌더 (공통) ─────────────────────────── */
  function RecordRow({ record, desktop }: { record: SubscriptionPaymentDto; desktop: boolean }) {
    const displayStatus = toDisplayStatus(record.status);
    const dateStr = (record.approvedAt ?? record.createdAt).slice(0, 10).replace(/-/g, ".");
    const pkgName = record.planName ?? planName ?? "패키지";

    if (!desktop) {
      return (
        <li className="border-b border-[var(--color-text-muted)] last:border-b-0">
          <div className="py-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-body-14-m text-[var(--color-text)]">{pkgName}</span>
              <StatusBadge status={displayStatus} />
              {displayStatus === "예정" && (
                <Link href="/mypage/subscription" className="text-body-14-m text-[var(--color-accent)] underline">
                  구독 변경
                </Link>
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
                {record.amount.toLocaleString("ko-KR")}원
              </span>
              <span className="text-body-14-m text-[var(--color-text-tertiary)]">{dateStr}</span>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li className="border-b border-[var(--color-text-muted)] last:border-b-0">
        <div className="grid grid-cols-[1fr_90px_130px_56px] items-center px-8 py-[14px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-14-m text-[var(--color-text)]">{pkgName}</span>
            <StatusBadge status={displayStatus} />
            {displayStatus === "예정" && (
              <Link href="/mypage/subscription" className="text-body-14-m text-[var(--color-accent)] underline hover:opacity-80">
                플랜 변경하기
              </Link>
            )}
          </div>
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

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* ━━━━━━━━ 모바일 레이아웃 ━━━━━━━━ */}
      <div className="md:hidden pb-12">
        <div className="flex items-center gap-2 px-6 py-5">
          <Link
            href="/mypage"
            aria-label="마이페이지로 돌아가기"
            className="flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          >
            <BackIcon />
          </Link>
          <h1 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
            결제관리
          </h1>
        </div>

        <div className="flex flex-col gap-4 px-4">
          {/* 결제 정보 카드 */}
          <div className="rounded-2xl bg-white px-6 py-5">
            <p className="mb-4 text-subtitle-16-b text-[var(--color-text)]">결제관리</p>

            <div className="flex items-center gap-3 py-2.5">
              <span className={LABEL_CLS}>결제수단</span>
              <span className={billingInfo ? VALUE_CLS : UNREGISTERED_CLS}>{methodDisplay}</span>
            </div>

            <div className="flex items-start gap-3 py-2.5">
              <span className={LABEL_CLS}>간편 결제</span>
              <div className="flex flex-col gap-2">
                <span className={billingInfo ? VALUE_CLS : UNREGISTERED_CLS}>{simplePaymentDisplay}</span>
                <button
                  type="button"
                  onClick={handleOpenPayment}
                  className="inline-flex w-[88px] h-[24px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-accent)] text-body-13-m text-white hover:opacity-90 transition-opacity"
                >
                  결제등록/변경
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2.5">
              <span className={LABEL_CLS}>다음 결제일</span>
              <span className={VALUE_CLS}>{nextDateDisplay}</span>
            </div>
          </div>

          {/* 결제 내역 카드 */}
          <div className="rounded-2xl bg-white px-5">
            {payments.length === 0 ? (
              <p className="py-8 text-center text-body-14-m text-[var(--color-text-label)]">
                결제 내역이 없습니다.
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

      {/* ━━━━━━━━ 데스크톱 레이아웃 ━━━━━━━━ */}
      <div className="max-md:hidden py-10">
        <div className="mx-auto max-w-content px-8">
          <div className="rounded-2xl bg-white px-8 py-8">
            <div className="mb-6 flex items-center gap-2">
              <Link
                href="/mypage"
                aria-label="마이페이지로 돌아가기"
                className="flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <BackIcon />
              </Link>
              <h1 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
                결제관리
              </h1>
            </div>

            {/* 결제 정보 박스 */}
            <div className="mb-4 rounded-2xl bg-[var(--color-surface-light)] px-8 py-6">
              {planName && (
                <p className="mb-4 text-subtitle-16-b text-[var(--color-text)]">
                  {planName} 구독중
                </p>
              )}
              <div className="flex items-center gap-0 mb-4">
                <span className={LABEL_CLS}>결제수단</span>
                <span className={billingInfo ? VALUE_CLS : UNREGISTERED_CLS}>{methodDisplay}</span>
              </div>
              <div className="flex items-center gap-0 mb-4">
                <span className={LABEL_CLS}>간편 결제</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={billingInfo ? VALUE_CLS : UNREGISTERED_CLS}>
                    {simplePaymentDisplay}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenPayment}
                    className="inline-flex items-center rounded-[4px] bg-[var(--color-accent)] px-2 py-[4px] text-body-13-m text-white hover:opacity-90 transition-opacity"
                  >
                    결제등록/변경
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-0">
                <span className={LABEL_CLS}>다음 결제일</span>
                <span className={VALUE_CLS}>{nextDateDisplay}</span>
              </div>
            </div>

            {/* 결제 내역 테이블 */}
            <div>
              <div className="grid grid-cols-[1fr_90px_130px_56px] items-center rounded-lg bg-[var(--color-surface-light)] px-8 py-3 mb-0">
                <span className="text-body-16-m text-[var(--color-text-tertiary)]">구독</span>
                <span className="text-body-16-m text-[var(--color-text-tertiary)]">금액</span>
                <span className="text-body-16-m text-[var(--color-text-tertiary)]">직접입력</span>
                <span className="text-body-16-m text-[var(--color-text-tertiary)] text-center">영수증</span>
              </div>

              {payments.length === 0 ? (
                <p className="py-8 text-center text-body-14-m text-[var(--color-text-label)]">
                  결제 내역이 없습니다.
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
          </div>
        </div>
      </div>

    </div>
  );
}
