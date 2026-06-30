"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon, ChevronIcon } from "./icons";
import { YearMonthPicker } from "./YearMonthPicker";

export function MonthBanner({
  selectedMonth,
  showPicker,
  selectedYear,
  bannerPadding,
  isLoading,
  onPrevMonth,
  onNextMonth,
  onPickerOpen,
  onPickerClose,
  onMonthSelect,
}: {
  selectedMonth: number;
  showPicker: boolean;
  selectedYear: number;
  bannerPadding: string;
  isLoading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPickerOpen: () => void;
  onPickerClose: () => void;
  onMonthSelect: (year: number, month: number) => void;
}) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLButtonElement>(null);
  const [tailLeft, setTailLeft] = useState(200);

  useEffect(() => {
    if (!showPicker) return;
    function handlePointerDown(e: PointerEvent) {
      if (bannerRef.current && !bannerRef.current.contains(e.target as Node)) {
        onPickerClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showPicker, onPickerClose]);

  useEffect(() => {
    if (!showPicker || !bannerRef.current || !calendarRef.current) return;
    const bannerRect = bannerRef.current.getBoundingClientRect();
    const calRect = calendarRef.current.getBoundingClientRect();
    const center = calRect.left - bannerRect.left + calRect.width / 2;
    setTailLeft(center - 6);
  }, [showPicker]);

  return (
    <div
      ref={bannerRef}
      className={`relative flex h-9 items-center rounded-t-[20px] bg-[var(--color-cta-button)] ${bannerPadding}`}
    >
      <div ref={navRef} className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevMonth}
          disabled={isLoading}
          aria-label="이전 달"
          className="flex h-8 w-8 items-center justify-center text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <ChevronIcon dir="left" />
        </button>
        <span className="min-w-[2.5rem] text-center text-subtitle-16-b tracking-[-0.04em] text-white">
          {selectedMonth}월
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          disabled={isLoading}
          aria-label="다음 달"
          className="flex h-8 w-8 items-center justify-center text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <ChevronIcon dir="right" />
        </button>
        <button
          ref={calendarRef}
          type="button"
          onClick={() => (showPicker ? onPickerClose() : onPickerOpen())}
          disabled={isLoading}
          aria-label="달력 열기"
          aria-expanded={showPicker}
          className="flex h-8 w-8 items-center justify-center text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <CalendarIcon />
        </button>
      </div>
      {showPicker && (
        <YearMonthPicker
          year={selectedYear}
          month={selectedMonth}
          tailLeft={tailLeft}
          onSelect={onMonthSelect}
        />
      )}
    </div>
  );
}
