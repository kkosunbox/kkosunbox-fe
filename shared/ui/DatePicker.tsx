"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  /** 선택 시 트리거에 보여 줄 문자열 (미지정 시 `YYYY. MM. DD` 형식) */
  formatDisplay?: (date: Date) => string;
  /** wrapper div에 적용할 className */
  className?: string;
  /** trigger 버튼에 추가로 적용할 className (기본 스타일을 오버라이드) */
  triggerClassName?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  /** form의 label htmlFor 연결용 */
  id?: string;
}

/* ─────────────────────────────
   Helpers
───────────────────────────── */

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
] as const;

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* ─────────────────────────────
   Inline SVG icons
───────────────────────────── */

function CalendarTriggerIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0 transition-colors"
      style={{ color: active ? "var(--color-accent)" : "var(--color-text-secondary)" }}
    >
      <path
        d="M6.66667 5.83333V2.5M13.3333 5.83333V2.5M5.83333 9.16667H14.1667M4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V5.83333C17.5 4.91286 16.7538 4.16667 15.8333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 월 이동 화살표 (< >) — 헤더 우측 버튼 안에 사용 */
function ChevronSmallIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {dir === "left" ? (
        <path
          d="M12.5 5L7.5 10L12.5 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M7.5 5L12.5 10L7.5 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/** 연·월 선택 드롭다운 화살표 */
function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6 8L10 12L14 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─────────────────────────────
   View modes
───────────────────────────── */
type CalendarView = "days" | "months" | "years";

/* ─────────────────────────────
   DatePicker
───────────────────────────── */

export default function DatePicker({
  value,
  onChange,
  placeholder = "날짜 선택",
  formatDisplay,
  className,
  triggerClassName,
  minDate,
  maxDate,
  disabled = false,
  id,
}: DatePickerProps) {
  const today = startOfDay(new Date());

  const displayLabel = value
    ? formatDisplay
      ? formatDisplay(value)
      : formatDate(value)
    : null;

  const [isOpen, setIsOpen] = useState(false);
  const [popupRect, setPopupRect] = useState({ top: 0, left: 0 });
  const [viewYear, setViewYear] = useState(
    () => value?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    () => value?.getMonth() ?? today.getMonth()
  );
  const [calendarView, setCalendarView] = useState<CalendarView>("days");

  /* 외부에서 value가 바뀌면 달력이 보이는 연·월을 맞춤 */
  const valueEpoch = value?.getTime() ?? null;
  const [syncedValueEpoch, setSyncedValueEpoch] = useState<number | null>(() => valueEpoch);
  if (valueEpoch !== syncedValueEpoch) {
    setSyncedValueEpoch(valueEpoch);
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const POPUP_WIDTH = 256;
  const POPUP_GAP = 6;
  const POPUP_EST_HEIGHT = 360;

  const updatePopupPosition = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;

    const r = btn.getBoundingClientRect();
    const vv = window.visualViewport;
    const vw = vv?.width ?? window.innerWidth;
    const vh = vv?.height ?? window.innerHeight;

    const spaceBelow = vh - r.bottom;
    const spaceAbove = r.top;
    const openUpward = spaceBelow < POPUP_EST_HEIGHT && spaceAbove > spaceBelow;

    let top: number;
    if (openUpward) {
      const h = popupRef.current?.offsetHeight ?? POPUP_EST_HEIGHT;
      top = r.top - h - POPUP_GAP;
    } else {
      top = r.bottom + POPUP_GAP;
    }

    let left = r.left;
    const maxLeft = vw - POPUP_WIDTH - 8;
    const minLeft = 8;
    if (left > maxLeft) left = maxLeft;
    if (left < minLeft) left = minLeft;

    const popupH = popupRef.current?.offsetHeight ?? POPUP_EST_HEIGHT;
    top = Math.min(top, vh - popupH - 8);
    top = Math.max(8, top);

    setPopupRect({ top, left });
  }, []);

  /* 바깥 클릭 시 닫기 */
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t) || popupRef.current?.contains(t)) return;
      setIsOpen(false);
      setCalendarView("days");
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    /* 첫 페인트 전에 좌표 확정 — 생략 시 popupRect(0,0)으로 한 프레임 노출됨 */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- useLayoutEffect + 측정 직후 동기 좌표 반영(깜빡임 방지)
    updatePopupPosition();
    const raf = requestAnimationFrame(() => updatePopupPosition());
    const onReposition = () => updatePopupPosition();
    window.addEventListener("resize", onReposition);
    window.visualViewport?.addEventListener("resize", onReposition);
    window.visualViewport?.addEventListener("scroll", onReposition);
    document.addEventListener("scroll", onReposition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onReposition);
      window.visualViewport?.removeEventListener("resize", onReposition);
      window.visualViewport?.removeEventListener("scroll", onReposition);
      document.removeEventListener("scroll", onReposition, true);
    };
  }, [isOpen, updatePopupPosition, calendarView, viewYear, viewMonth]);


  /* Escape 키로 닫기 */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setCalendarView("days");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);
  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  /* 달력 셀 생성 */
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  /* 이전 달 날짜 채우기 */
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const prevMonthCells: { day: number; currentMonth: false }[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthCells.push({ day: prevMonthDays - i, currentMonth: false });
  }

  /* 현재 달 날짜 */
  const currentCells: { day: number; currentMonth: true }[] = Array.from(
    { length: daysInMonth },
    (_, i) => ({ day: i + 1, currentMonth: true })
  );

  const allCells = [...prevMonthCells, ...currentCells];
  /* 다음 달 날짜 채우기 */
  let nextDay = 1;
  while (allCells.length % 7 !== 0 || allCells.length < 35) {
    allCells.push({ day: nextDay++, currentMonth: false });
    if (allCells.length >= 42) break;
  }

  const isDisabledDay = (day: number) => {
    const d = startOfDay(new Date(viewYear, viewMonth, day));
    if (minDate && d < startOfDay(minDate)) return true;
    if (maxDate && d > startOfDay(maxDate)) return true;
    return false;
  };

  const handleDayClick = (day: number) => {
    if (isDisabledDay(day)) return;
    onChange(new Date(viewYear, viewMonth, day));
    setIsOpen(false);
    setCalendarView("days");
  };

  const handleMonthSelect = (month: number) => {
    setViewMonth(month);
    setCalendarView("days");
  };

  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setCalendarView("months");
  };

  const handleHeaderClick = () => {
    if (calendarView === "days") setCalendarView("months");
    else if (calendarView === "months") setCalendarView("years");
    else setCalendarView("days");
  };

  /* 연도 선택용 범위 (현재 viewYear 기준 ±6년) */
  const yearStart = viewYear - 6;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  /* ── trigger 기본 스타일 */
  const triggerBase = [
    "flex h-[44px] w-full items-center justify-between",
    "rounded-lg border border-[var(--color-divider-warm)] bg-white px-4",
    "text-left outline-none transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    isOpen
      ? "border-[var(--color-primary)]"
      : "hover:border-[var(--color-primary)]",
    triggerClassName,
  ].filter(Boolean).join(" ");

  return (
    <div ref={containerRef} className={["relative", className].filter(Boolean).join(" ")}>
      {/* ── Trigger ── */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((v) => !v);
          setCalendarView("days");
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={value && displayLabel ? `선택된 날짜: ${displayLabel}` : placeholder}
        className={triggerBase}
      >
        <span
          className={[
            "min-w-0 flex-1 truncate whitespace-nowrap pr-2 text-[14px] leading-[1.4]",
            value
              ? "font-semibold text-[var(--color-text)] tracking-[0.2px]"
              : "font-medium text-[var(--color-text-secondary)]",
          ].join(" ")}
        >
          {displayLabel ?? placeholder}
        </span>
        <CalendarTriggerIcon active={isOpen || !!value} />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            role="dialog"
            aria-label="날짜 선택 달력"
            className="z-[1000]"
            style={{
              position: "fixed",
              top: popupRect.top,
              left: popupRect.left,
              width: POPUP_WIDTH,
              background: "#FFFFFF",
              boxShadow: "0px 18px 28px rgba(9, 30, 66, 0.1)",
              borderRadius: 14,
            }}
          >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between"
            style={{ padding: "16px 16px 0 16px", height: 24 + 16 }}
          >
            {/* 연·월 클릭 영역 */}
            <button
              type="button"
              onClick={handleHeaderClick}
              className="flex items-center gap-1 rounded-md px-2 py-[2px] transition-colors hover:bg-[var(--color-secondary)]"
            >
              <span
                style={{
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "150%",
                  color: "#252525",
                }}
              >
                {calendarView === "years"
                  ? `${years[0]} – ${years[years.length - 1]}`
                  : calendarView === "months"
                  ? `${viewYear}`
                  : `${String(viewMonth + 1).padStart(2, "0")}월 ${viewYear}`}
              </span>
              <ChevronDownIcon />
            </button>

            {/* 이전/다음 버튼 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (calendarView === "years") setViewYear((y) => y - 12);
                  else if (calendarView === "months") setViewYear((y) => y - 1);
                  else prevMonth();
                }}
                aria-label="이전"
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid #E2E2E2",
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#B0B0B0",
                }}
              >
                <ChevronSmallIcon dir="left" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (calendarView === "years") setViewYear((y) => y + 12);
                  else if (calendarView === "months") setViewYear((y) => y + 1);
                  else nextMonth();
                }}
                aria-label="다음"
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid #E2E2E2",
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#B0B0B0",
                }}
              >
                <ChevronSmallIcon dir="right" />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "12px 16px 16px" }}>
            {calendarView === "days" && (
              <>
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7" style={{ marginBottom: 0 }}>
                  {DAY_LABELS.map((d) => (
                    <div
                      key={d}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "Pretendard, sans-serif",
                        fontWeight: 500,
                        fontSize: 12,
                        lineHeight: "150%",
                        color: "#808080",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7">
                  {allCells.map((cell, idx) => {
                    if (!cell.currentMonth) {
                      return (
                        <div
                          key={`blank-${idx}`}
                          style={{ width: 32, height: 32 }}
                          aria-hidden="true"
                        />
                      );
                    }

                    const { day } = cell;
                    const d = new Date(viewYear, viewMonth, day);
                    const isToday = isSameDay(d, today);
                    const isSel = value != null && isSameDay(d, value);
                    const dayDisabled = isDisabledDay(day);

                    /* 선택된 날 → #F6E9DD 배경, #252525 텍스트 */
                    let bgColor = "transparent";
                    let textColor = "#2F2F2F";

                    if (isSel) {
                      bgColor = "#F6E9DD";
                      textColor = "#252525";
                    } else if (dayDisabled) {
                      textColor = "#DDDDDD";
                    }

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        disabled={dayDisabled}
                        aria-label={`${viewYear}년 ${viewMonth + 1}월 ${day}일`}
                        aria-pressed={isSel}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9999,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          cursor: dayDisabled ? "not-allowed" : "pointer",
                        }}
                      >
                        {/* inner background circle (with 2px inset) */}
                        <span
                          style={{
                            position: "absolute",
                            inset: 2,
                            borderRadius: 9999,
                            background: bgColor,
                            transition: "background 150ms",
                          }}
                        />
                        <span
                          style={{
                            position: "relative",
                            fontFamily: "Pretendard, sans-serif",
                            fontWeight: isToday && !isSel ? 700 : 500,
                            fontSize: 14,
                            lineHeight: "150%",
                            color: textColor,
                          }}
                        >
                          {day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {calendarView === "months" && (
              <div className="grid grid-cols-3 gap-2" style={{ paddingTop: 8 }}>
                {MONTH_LABELS.map((label, i) => {
                  const isCurrent = i === viewMonth && viewYear === today.getFullYear();
                  const isSelected = i === viewMonth;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleMonthSelect(i)}
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: "none",
                        background: isSelected ? "#F6E9DD" : "transparent",
                        fontFamily: "Pretendard, sans-serif",
                        fontWeight: isCurrent ? 700 : 500,
                        fontSize: 14,
                        color: "#252525",
                        cursor: "pointer",
                        transition: "background 150ms",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#F9F1EA";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {calendarView === "years" && (
              <div className="grid grid-cols-3 gap-2" style={{ paddingTop: 8 }}>
                {years.map((year) => {
                  const isCurrent = year === today.getFullYear();
                  const isSelected = year === viewYear;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: "none",
                        background: isSelected ? "#F6E9DD" : "transparent",
                        fontFamily: "Pretendard, sans-serif",
                        fontWeight: isCurrent ? 700 : 500,
                        fontSize: 14,
                        color: "#252525",
                        cursor: "pointer",
                        transition: "background 150ms",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#F9F1EA";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
