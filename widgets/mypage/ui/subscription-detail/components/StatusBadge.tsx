import type { DisplayStatus } from "../helpers";

export function StatusBadge({ status }: { status: DisplayStatus }) {
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
