import type { SubscriptionPaymentDto } from "@/features/subscription/api/types";
import {
  DELIVERY_STATUS_LABEL,
  EPOST_TRACKING_BASE,
  ROW_GRID,
  ROW_HEIGHT,
  formatDate,
  formatPrice,
  toDisplayStatus,
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
  const displayStatus = toDisplayStatus(record.status);
  const dateStr = formatDate(record.approvedAt ?? record.createdAt);
  const pkgName = record.planName ?? planName;

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
                onClick={() => onCancelPayment(record.id)}
                className="shrink-0 text-right text-body-13-sb leading-[130%] text-[var(--color-btn-dark-warm)] underline hover:opacity-80"
              >
                구독취소
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
                onClick={() => onCancelPayment(record.id)}
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
