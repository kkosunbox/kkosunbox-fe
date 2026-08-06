"use client";

import { useMemo, useState } from "react";
import { computeStartDateRange } from "@/features/order";

export type StartDateMode = "immediate" | "scheduled";

export interface StartDateStateResult {
  startDateMode: StartDateMode;
  scheduledDate: Date | null;
  minScheduledDate: Date;
  maxScheduledDate: Date;
  handleStartDateModeChange: (mode: StartDateMode) => void;
  handleScheduledDateChange: (date: Date) => void;
}

export function useStartDateState(): StartDateStateResult {
  const [startDateMode, setStartDateMode] = useState<StartDateMode>("immediate");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  // 렌더마다 "오늘"이 바뀌지 않도록 최초 마운트 시점에 한 번만 계산
  const { minDate, maxDate } = useMemo(() => computeStartDateRange(new Date()), []);

  function handleStartDateModeChange(mode: StartDateMode) {
    setStartDateMode(mode);
  }

  function handleScheduledDateChange(date: Date) {
    setScheduledDate(date);
  }

  return {
    startDateMode,
    scheduledDate,
    minScheduledDate: minDate,
    maxScheduledDate: maxDate,
    handleStartDateModeChange,
    handleScheduledDateChange,
  };
}
