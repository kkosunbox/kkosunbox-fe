"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      {dir === "left" ? (
        <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function DoubleChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      {dir === "left" ? (
        <>
          <path d="M8 10.5L4.5 7 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 10.5L7.5 7 11 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M6 3.5L9.5 7 6 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 3.5L6.5 7 3 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

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
  const [openUp, setOpenUp] = useState(false);
  const [viewYear, setViewYear] = useState(
    () => value?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    () => value?.getMonth() ?? today.getMonth()
  );

  /* 외부에서 value가 바뀌면 달력이 보이는 연·월을 맞춤 (effect 대신 렌더 중 동기화 — cascading effect 경고 회피) */
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

  /* 바깥 클릭 시 닫기 */
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  /* Escape 키로 닫기 */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const prevYear  = useCallback(() => setViewYear((y) => y - 1), []);
  const nextYear  = useCallback(() => setViewYear((y) => y + 1), []);
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
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

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
  };

  /* ── trigger 기본 스타일 (프로젝트 form input 규격) */
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
          if (!isOpen) {
            const btn = triggerRef.current;
            if (btn) {
              const { bottom } = btn.getBoundingClientRect();
              setOpenUp(window.innerHeight - bottom < 340);
            }
          }
          setIsOpen((v) => !v);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={value && displayLabel ? `선택된 날짜: ${displayLabel}` : placeholder}
        className={triggerBase}
      >
        <span
          className={[
            "text-[14px] leading-[1.4]",
            value
              ? "font-semibold text-[var(--color-text)] tracking-[0.2px]"
              : "font-medium text-[var(--color-text-secondary)]",
          ].join(" ")}
        >
          {displayLabel ?? placeholder}
        </span>
        <CalendarTriggerIcon active={isOpen || !!value} />
      </button>

      {/* ── Calendar popup ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="날짜 선택 달력"
          className={[
            "absolute left-0 z-50",
            openUp ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
            "w-72 overflow-hidden rounded-2xl border border-[var(--color-divider-warm)] bg-white",
            "shadow-[0_8px_32px_rgba(201,122,61,0.12)]",
          ].join(" ")}
        >
          {/* ── Header: 따뜻한 베이지 배경 ── */}
          <div className="flex items-center justify-between bg-[var(--color-secondary)] px-3 py-2.5">
            {/* 이전 연도 / 이전 월 */}
            <div className="flex items-center gap-0.5">
              <NavBtn onClick={prevYear} label="이전 연도" secondary>
                <DoubleChevronIcon dir="left" />
              </NavBtn>
              <NavBtn onClick={prevMonth} label="이전 달">
                <ChevronIcon dir="left" />
              </NavBtn>
            </div>

            <span
              className="select-none text-[15px] font-semibold tracking-[-0.02em]"
              style={{ color: "var(--color-brown-dark)" }}
            >
              {viewYear}년 {viewMonth + 1}월
            </span>

            {/* 다음 월 / 다음 연도 */}
            <div className="flex items-center gap-0.5">
              <NavBtn onClick={nextMonth} label="다음 달">
                <ChevronIcon dir="right" />
              </NavBtn>
              <NavBtn onClick={nextYear} label="다음 연도" secondary>
                <DoubleChevronIcon dir="right" />
              </NavBtn>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-3">
            {/* 요일 헤더 */}
            <div className="mb-1 grid grid-cols-7 text-center">
              {DAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  className={[
                    "py-1 text-[11px] font-semibold",
                    i === 0
                      ? "text-[var(--color-accent-orange)]"
                      : i === 6
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)]",
                  ].join(" ")}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`_${idx}`} className="h-9" aria-hidden="true" />;
                }

                const d        = new Date(viewYear, viewMonth, day);
                const isToday  = isSameDay(d, today);
                const isSel    = value != null && isSameDay(d, value);
                const disabled = isDisabledDay(day);
                const dow      = d.getDay(); // 0=일, 6=토

                const base = "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium transition-colors ";

                const colorCls = isSel
                  ? "bg-[var(--color-primary)] text-white font-semibold shadow-sm"
                  : isToday
                  ? "ring-[1.5px] ring-inset ring-[var(--color-primary)] text-[var(--color-primary)] font-semibold hover:bg-[var(--color-secondary)]"
                  : disabled
                  ? "cursor-not-allowed text-[var(--color-text-muted)]"
                  : dow === 0
                  ? "cursor-pointer text-[var(--color-accent-orange)] hover:bg-[var(--color-secondary)]"
                  : dow === 6
                  ? "cursor-pointer text-[var(--color-accent)] hover:bg-[var(--color-secondary)]"
                  : "cursor-pointer text-[var(--color-text)] hover:bg-[var(--color-secondary)]";

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={disabled}
                    aria-label={`${viewYear}년 ${viewMonth + 1}월 ${day}일`}
                    aria-pressed={isSel}
                    className={base + colorCls}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 헤더 네비게이션 버튼 ── */
function NavBtn({
  children,
  onClick,
  label,
  secondary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
        secondary
          ? "text-[var(--color-text-secondary)] hover:bg-[var(--color-beige)]"
          : "text-[var(--color-primary)] hover:bg-[var(--color-beige)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
