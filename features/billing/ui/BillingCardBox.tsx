"use client";

import type { BillingInfo } from "../api/types";
import { getCardName, getLastFourDigits } from "../lib/formatBillingLabel";

/** 등록된 카드 한 장을 보여주는 박스. 결제 팝업의 여러 화면에서 공용으로 쓴다. */
export default function BillingCardBox({ billing }: { billing: BillingInfo }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-5 py-5">
      <div className="flex items-center gap-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="2"
            stroke="var(--color-text)"
            strokeWidth="1.5"
          />
          <path d="M2 10H22" stroke="var(--color-text)" strokeWidth="1.5" />
        </svg>
        <div className="flex flex-col gap-0.5">
          <span className="text-body-14-sb text-[var(--color-text)]">
            {getCardName(billing)}
          </span>
          <span className="text-body-13-r text-[var(--color-text-secondary)]">
            **** **** **** {getLastFourDigits(billing)}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="ml-auto shrink-0"
        >
          <circle cx="8" cy="8" r="8" fill="var(--color-btn-dark-warm)" />
          <path
            d="M5 8l2 2 4-4"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
