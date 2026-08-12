import type { SubscriptionPaymentDto } from "@/features/subscription/api/types";
import { isPaymentCancelable } from "@/features/subscription/lib/paymentCancelable";
import {
  EPOST_TRACKING_BASE,
  ROW_GRID,
  ROW_HEIGHT,
  formatDate,
  formatPrice,
} from "../helpers";
import { DownloadIcon } from "./icons";
import { StatusBadge } from "./StatusBadge";

interface RecordRowProps {
  record: SubscriptionPaymentDto;
  planName: string;
  desktop: boolean;
  isOnly?: boolean;
  onCancelPayment: (paymentId: number) => void;
  onReceiptDownload: (paymentId: number) => void;
}

export function RecordRow({
  record,
  planName,
  desktop,
  isOnly,
  onCancelPayment,
  onReceiptDownload,
}: RecordRowProps) {
  const dateStr = formatDate(record.approvedAt ?? record.createdAt);
  const pkgName = record.planName ?? planName;

  // 배송중 건은 취소 불가 — 판정은 공용 술어에 위임한다.
  // 결제 대기(pending) 건의 취소 버튼은 기존 동작 그대로 유지한다.
  const canCancelPayment = isPaymentCancelable(record);

  const statusBadge = record.trackingNumber ? (
    <a
      href={`${EPOST_TRACKING_BASE}?sid1=${encodeURIComponent(record.trackingNumber)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:opacity-80"
    >
      <StatusBadge status={record.displayStatus} />
    </a>
  ) : (
    <StatusBadge status={record.displayStatus} />
  );

  if (!desktop) {
    return (
      <li className={`border-b border-[var(--color-text-muted)] ${isOnly ? "" : "last:border-b-0"}`}>
        <div className="py-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-14-m text-[var(--color-text)]">{pkgName}</span>
            {(record.displayStatus === "pending" || canCancelPayment) && (
              <button
                type="button"
                onClick={() => onCancelPayment(record.id)}
                className="shrink-0 text-right text-body-13-sb leading-[130%] text-[var(--color-btn-dark-warm)] underline hover:opacity-80"
              >
                결제취소
              </button>
            )}
            <button
              type="button"
              aria-label={`${dateStr} 영수증 다운로드`}
              onClick={() => onReceiptDownload(record.id)}
              className="ml-auto hover:opacity-70 transition-opacity"
            >
              <DownloadIcon />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-body-14-m text-[var(--color-text)]">{formatPrice(record.amount)}</span>
              {statusBadge}
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
          {(record.displayStatus === "pending" || canCancelPayment) && (
            <button
              type="button"
              onClick={() => onCancelPayment(record.id)}
              className="shrink-0 text-right text-body-13-sb leading-[130%] text-[var(--color-btn-dark-warm)] underline hover:opacity-80"
            >
              결제취소
            </button>
          )}
        </div>
        <div className="flex items-center">{statusBadge}</div>
        <span className="text-body-14-m text-[var(--color-text)]">{formatPrice(record.amount)}</span>
        <span className="text-body-14-m text-[var(--color-text)]">{dateStr}</span>
        <div className="flex justify-start">
          <button
            type="button"
            aria-label={`${dateStr} 영수증 다운로드`}
            onClick={() => onReceiptDownload(record.id)}
            className="hover:opacity-70 transition-opacity"
          >
            <DownloadIcon />
          </button>
        </div>
      </div>
    </li>
  );
}
