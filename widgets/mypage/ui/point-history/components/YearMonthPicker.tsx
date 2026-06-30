"use client";

import { useState } from "react";
import { buildYearRange } from "../pointHistoryHelpers";
import { PickerChevronIcon } from "./icons";

type PickerView = "month" | "year";

export function YearMonthPicker({
  year,
  month,
  tailLeft,
  onSelect,
}: {
  year: number;
  month: number;
  tailLeft: number;
  onSelect: (y: number, m: number) => void;
}) {
  const [pickerYear, setPickerYear] = useState(year);
  const [view, setView] = useState<PickerView>("month");

  // year prop이 바뀌면(다른 달 조회) picker를 해당 연도·월뷰로 리셋한다.
  const [prevYear, setPrevYear] = useState(year);
  if (year !== prevYear) {
    setPrevYear(year);
    setPickerYear(year);
    setView("month");
  }

  const years = buildYearRange(pickerYear);

  return (
    <div
      className="absolute left-0 top-[calc(100%+10px)] z-50 w-[280px]"
      role="dialog"
      aria-label="년월 선택"
    >
      {/* 말풍선 꼬리 */}
      <div
        className="pointer-events-none absolute -top-[6px] h-3 w-3 rotate-45 bg-white"
        style={{ left: tailLeft, boxShadow: "-2px -2px 4px rgba(0,0,0,0.04)" }}
        aria-hidden="true"
      />
      <div className="relative rounded-[20px] bg-white px-6 py-5 shadow-[0px_8px_24px_rgba(0,0,0,0.12)]">
        <div className="mb-5 flex items-center gap-4">
          <span className="text-body-16-b tracking-[-0.04em] text-[var(--color-text)]">
            {String(month).padStart(2, "0")}월
          </span>
          <button
            type="button"
            onClick={() => setView((v) => (v === "year" ? "month" : "year"))}
            className="flex items-center gap-1 text-body-16-b tracking-[-0.04em] text-[var(--color-text)] transition-opacity hover:opacity-70"
            aria-expanded={view === "year"}
          >
            {pickerYear}
            <PickerChevronIcon dir={view === "year" ? "up" : "down"} />
          </button>
        </div>

        {view === "month" ? (
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelect(pickerYear, m)}
                className={[
                  "py-1 text-center text-body-14-m tracking-[-0.04em] transition-colors",
                  pickerYear === year && m === month
                    ? "font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text)] hover:text-[var(--color-text-secondary)]",
                ].join(" ")}
              >
                {m}월
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setPickerYear(y);
                  setView("month");
                }}
                className={[
                  "py-1 text-center text-body-14-m tracking-[-0.04em] transition-colors",
                  y === pickerYear
                    ? "font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text)] hover:text-[var(--color-text-secondary)]",
                ].join(" ")}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
