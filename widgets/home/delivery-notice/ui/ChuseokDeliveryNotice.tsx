"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/shared/ui";

const STORAGE_KEY = "kkosoon_chuseok_delivery_notice_hidden_date";
const NOTICE_LAST_VISIBLE_DATE = "2026-10-04";

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

export default function ChuseokDeliveryNotice() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const today = getLocalDateKey();
        const isWithinNoticePeriod = today <= NOTICE_LAST_VISIBLE_DATE;
        const isHiddenToday = localStorage.getItem(STORAGE_KEY) === today;

        setIsOpen(isWithinNoticePeriod && !isHiddenToday);
      } catch {
        // 저장소를 사용할 수 없어도 공지 기간 안에서만 안내를 노출한다.
        setIsOpen(getLocalDateKey() <= NOTICE_LAST_VISIBLE_DATE);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function hideForToday() {
    try {
      localStorage.setItem(STORAGE_KEY, getLocalDateKey());
    } catch {
      // 저장에 실패해도 현재 열린 팝업은 닫을 수 있어야 한다.
    }
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <ModalShell
      label="추석 연휴 배송 안내"
      onClose={() => setIsOpen(false)}
      className="flex min-h-full items-center justify-center px-5 py-6"
      backdrop="soft"
    >
      <section className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-[var(--color-surface-warm)] shadow-[0_20px_60px_rgba(47,47,47,0.22)]">
        <div className="relative overflow-hidden px-6 pb-7 pt-8 text-center md:px-8 md:pb-8 md:pt-9">
          <div className="absolute -left-10 -top-12 h-36 w-36 rounded-full bg-[var(--color-surface-peach)] opacity-80" />
          <div className="absolute -right-8 top-8 h-24 w-24 rounded-full border border-[var(--color-primary)] opacity-15" />
          <div className="absolute -right-3 top-12 h-24 w-24 rounded-full border border-[var(--color-primary)] opacity-10" />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="팝업 닫기"
            className="absolute right-5 top-5 z-10 grid h-8 w-8 place-items-center rounded-full text-[var(--color-text-warm)] transition-colors hover:bg-white hover:text-[var(--color-text)]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-white text-[var(--color-primary)] shadow-[0_6px_20px_rgba(201,122,61,0.16)]">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-8 w-8" fill="none">
              <path d="M33.5 7.5c-8 1.7-13.4 9.5-11.7 17.5 1.7 8 9.5 13.4 17.5 11.7A16 16 0 1 1 33.5 7.5Z" fill="currentColor" opacity=".9" />
              <path d="m12 12 1.1 2.9L16 16l-2.9 1.1L12 20l-1.1-2.9L8 16l2.9-1.1L12 12Z" fill="currentColor" opacity=".55" />
            </svg>
          </div>

          <p className="relative text-body-13-sb tracking-[0.16em] text-[var(--color-primary)]">HAPPY CHUSEOK</p>
          <h2 className="relative mt-2 text-title-28-b text-[var(--color-text)] max-md:text-title-24-b">추석 연휴 배송 안내</h2>
          <p className="relative mt-2 text-body-14-r text-[var(--color-text-warm)]">
            택배사 운영 방침에 따라 배송 일정이 변경됩니다.
          </p>
        </div>

        <div className="mx-5 rounded-[20px] border border-[var(--color-border-light)] bg-white px-5 py-5 md:mx-6 md:px-6">
          <dl className="space-y-4">
            <div className="flex items-start gap-4">
              <dt className="w-[72px] shrink-0 pt-0.5 text-body-13-sb text-[var(--color-text-warm)]">배송 휴무</dt>
              <dd className="text-body-14-sb text-[var(--color-text)]">
                9월 22일(화) 오전 10시 이후 결제 건
                <span className="mt-1 block text-[var(--color-primary)]">~ 9월 27일(일)</span>
              </dd>
            </div>
            <div className="h-px bg-[var(--color-border-light)]" />
            <div className="flex items-start gap-4">
              <dt className="w-[72px] shrink-0 pt-0.5 text-body-13-sb text-[var(--color-text-warm)]">배송 재개</dt>
              <dd className="text-body-14-sb text-[var(--color-text)]">
                <span className="rounded-full bg-[var(--color-surface-peach)] px-2.5 py-1 text-[var(--color-primary)]">9월 28일(월)</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="px-7 pb-6 pt-5 text-center md:px-8">
          <p className="text-body-13-r text-[var(--color-text-label)]">
            배송 재개일부터 결제 순서에 따라 순차적으로 출고됩니다.
            <br />조금만 기다려 주시면 정성껏 보내드릴게요.
          </p>
          <button
            data-autofocus
            type="button"
            onClick={hideForToday}
            className="mt-5 h-12 w-full rounded-[12px] bg-[var(--color-primary)] text-body-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            오늘 하루 보지 않음
          </button>
        </div>
      </section>
    </ModalShell>
  );
}
