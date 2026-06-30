import type { PointLedgerItem } from "@/features/point/api/types";

export const ITEMS_PER_PAGE = 10;

export type SortTab = "all" | "earn" | "date";

export const SORT_TABS: ReadonlyArray<{ id: SortTab; label: string }> = [
  { id: "all", label: "전체" },
  { id: "earn", label: "적립순" },
  { id: "date", label: "날짜순" },
];

export function fmtDate(d: string | null | undefined): string {
  if (!d) return "-";
  return d.slice(0, 10).replace(/-/g, ".");
}

export function fmtPoint(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}${amount.toLocaleString("ko-KR")}P`;
}

export function computeRunningBalances(items: PointLedgerItem[], currentBalance: number): number[] {
  let running = currentBalance;
  return items.map((item) => {
    const rb = running;
    running -= item.amount;
    return rb;
  });
}

export function buildYearRange(anchorYear: number): number[] {
  const end = Math.max(anchorYear, new Date().getFullYear());
  const start = end - 10;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

export function sortLedgerItems(items: PointLedgerItem[], sortTab: SortTab): PointLedgerItem[] {
  if (sortTab === "earn") return items.filter((i) => i.amount > 0);
  if (sortTab === "date") {
    return [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }
  return items;
}

/** sortTab별 잔여포인트(running balance) 배열 — sortedItems와 동일 길이 */
export function computeLedgerRunningBalances(
  sortedItems: PointLedgerItem[],
  sortTab: SortTab,
  allItems: PointLedgerItem[],
  totalAmount: number,
): number[] {
  if (sortTab === "date") {
    const itemsTotal = allItems.reduce((s, x) => s + x.amount, 0);
    let running = totalAmount - itemsTotal;
    return sortedItems.map((item) => {
      running += item.amount;
      return running;
    });
  }
  return computeRunningBalances(sortedItems, totalAmount);
}
