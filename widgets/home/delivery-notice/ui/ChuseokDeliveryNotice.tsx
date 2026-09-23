"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ModalShell } from "@/shared/ui";
import deliveryNoticeImage from "../assets/chuseok-delivery-notice.png";

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
  const [hideToday, setHideToday] = useState(false);

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

  function closePopup() {
    if (hideToday) {
      try {
        localStorage.setItem(STORAGE_KEY, getLocalDateKey());
      } catch {
        // 저장에 실패해도 현재 열린 팝업은 닫을 수 있어야 한다.
      }
    }
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <ModalShell
      label="추석 연휴 배송 안내"
      onClose={closePopup}
      className="flex min-h-full items-center justify-center px-4 py-4 md:px-6 md:py-6"
      backdrop="strong"
    >
      <section className="flex w-full flex-col max-md:max-h-[calc(100dvh-32px)] max-md:max-w-[420px] md:max-lg:max-h-[calc(100dvh-48px)] md:max-lg:max-w-[520px] lg:max-h-[calc(100dvh-48px)] lg:max-w-[560px]">
        <Image
          src={deliveryNoticeImage}
          alt="추석 연휴 배송 안내. 9월 22일 오전 10시 이후 결제 건부터 9월 27일까지 배송이 중단되며, 9월 28일부터 순차 출고됩니다."
          priority
          sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 520px, 560px"
          className="mx-auto h-auto min-h-0 w-auto max-w-full flex-1 rounded-[16px] object-contain"
        />

        <div className="mt-3 flex min-h-9 shrink-0 items-center justify-between gap-4 px-0.5 text-white md:mt-4 md:min-h-10">
          <label className="flex cursor-pointer items-center gap-2 max-md:text-body-13-sb text-body-14-sb">
            <span className="relative grid h-[18px] w-[18px] shrink-0 place-items-center">
              <input
                type="checkbox"
                checked={hideToday}
                onChange={event => setHideToday(event.target.checked)}
                className="peer h-full w-full cursor-pointer appearance-none rounded-[4px] border border-white bg-transparent checked:bg-white"
              />
              <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute hidden h-3.5 w-3.5 text-[var(--color-text)] peer-checked:block" fill="none">
                <path d="m3 8.2 3 3L13 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            오늘 하루 이 창을 열지 않음
          </label>

          <button
            data-autofocus
            type="button"
            onClick={closePopup}
            className="min-h-10 min-w-[64px] shrink-0 border-0 bg-transparent px-4 max-md:text-body-14-b text-body-16-b transition-opacity hover:opacity-70"
          >
            닫기
          </button>
        </div>
      </section>
    </ModalShell>
  );
}
