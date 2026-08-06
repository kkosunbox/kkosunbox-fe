import type { SubscriptionPaymentDto } from "@/features/subscription/api/types";
import { DISPLAY_STATUS_LABEL } from "../helpers";

export function StatusBadge({ status }: { status: SubscriptionPaymentDto["displayStatus"] }) {
  if (status === "pending" || status === "shipping") {
    return (
      <span className="inline-flex w-fit shrink-0 justify-self-start items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)] opacity-80">
        {DISPLAY_STATUS_LABEL[status]}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex w-fit shrink-0 justify-self-start items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-red-50 text-red-500 opacity-80">
        {DISPLAY_STATUS_LABEL[status]}
      </span>
    );
  }
  if (status === "preparing") {
    return (
      <span className="inline-flex w-fit shrink-0 justify-self-start items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-[var(--color-status-waiting-bg)] text-[var(--color-status-waiting)] opacity-80">
        {DISPLAY_STATUS_LABEL[status]}
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="inline-flex w-fit shrink-0 justify-self-start items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] opacity-80">
        {DISPLAY_STATUS_LABEL[status]}
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit shrink-0 justify-self-start items-center justify-center rounded-full px-3 py-1 text-btn-12-m bg-[var(--color-text-muted)] text-[var(--color-text-secondary)] opacity-80">
      {DISPLAY_STATUS_LABEL[status]}
    </span>
  );
}
