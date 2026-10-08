"use client";

import { useEffect, useRef, useState } from "react";
import { PackageProgressBar, PackageProgressMessage, type CartPackage } from "@/features/cart";
import { MEDIA_MD2_MIN } from "@/shared/config/breakpoints";
import { formatKrwPrice } from "@/shared/lib/format";
import { PACKAGE_LIST_SCROLL_CLASS, PackageItemList, PackageShippingRow } from "./PackageItemList";

interface Props {
  pkg: CartPackage;
  canPurchase: boolean;
  onPurchase: () => void;
  /** "상품 더 담기" — 시트를 닫는다 */
  onMore: () => void;
}

/** 하단 고정 요소가 가리는 높이 — 카카오 상담 버튼이 이 값만큼 올라간다 (KakaoTalkProvider) */
const INSET_VAR = "--floating-bottom-inset";

function ChevronRight() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 12.6673L10.6667 8.00065L6 3.33398" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TITLE = "text-[16px] font-semibold leading-[19px] tracking-[-0.04em] text-[var(--color-text-emphasis)]";
const SWITCH = "flex items-center gap-1 text-[14px] font-semibold leading-[17px] tracking-[-0.04em] text-[var(--color-text-emphasis)]";
const BUTTON = "h-10 rounded-lg text-[14px] font-semibold leading-[1.5] tracking-[-0.02em]";
/** 올라오기·내려가기 시간 — 닫을 때 이만큼 기다렸다가 호출부에 알린다 */
const SLIDE_DURATION_MS = 300;

/** 모바일·태블릿(<950px) 하단 내 패키지 바텀시트 — 그 이상은 PC 패널을 쓴다. 열지 말지는 호출부가 렌더 여부로 정한다 */
export default function PackageBottomSheet({ pkg, canPurchase, onPurchase, onMore }: Props) {
  const { progress } = pkg;
  const sheetRef = useRef<HTMLElement | null>(null);
  const [view, setView] = useState<"summary" | "items">("summary");
  // 올라오기는 CSS @starting-style(starting:)로, 내려가기는 이 상태로 처리한다.
  const [closing, setClosing] = useState(false);

  function handleMore() {
    if (closing) return;
    setClosing(true);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(onMore, reduceMotion ? 0 : SLIDE_DURATION_MS);
  }

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const root = document.documentElement;
    const desktop = window.matchMedia(MEDIA_MD2_MIN);
    // 시트가 가리는 만큼 페이지 끝(푸터)을 띄우고, 카카오 상담 버튼도 시트 위로 올린다.
    const sync = () => {
      const inset = desktop.matches ? "0px" : `${sheet.offsetHeight}px`;
      root.style.setProperty(INSET_VAR, inset);
      document.body.style.paddingBottom = inset;
    };
    const observer = new ResizeObserver(sync);
    observer.observe(sheet);
    desktop.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", sync);
      root.style.removeProperty(INSET_VAR);
      document.body.style.paddingBottom = "";
    };
  }, []);


  return (
    <section
      ref={sheetRef}
      aria-label="내 패키지"
      className={`md2:hidden fixed inset-x-0 bottom-0 z-40 rounded-t-[20px] transition-[translate] duration-300 ease-out motion-reduce:transition-none starting:translate-y-full ${closing ? "translate-y-full" : "translate-y-0"} bg-[var(--color-package-panel-bg)] shadow-[0_-4px_12px_rgba(0,0,0,0.16)] ${view === "items" ? "pb-[calc(24px+env(safe-area-inset-bottom))]" : "pb-[calc(21px+env(safe-area-inset-bottom))]"}`}
    >
      <div className="mx-auto w-full px-6 pt-[23px] md:max-w-[640px]">
        {view === "summary" ? (
          <>
            <div className="flex items-start justify-between">
              <h2 className={TITLE}>내 패키지</h2>
              <button type="button" onClick={() => setView("items")} className={SWITCH}>선택상품<ChevronRight /></button>
            </div>
            <p className="mt-1.5 text-[20px] font-extrabold leading-6 tracking-[-0.05em] text-[var(--color-cta-button)]"><span className="sr-only">담은 금액 </span>{formatKrwPrice(progress.amount)}</p>
            <div className="mt-[5px]"><PackageProgressBar progress={progress} variant="sheet" /></div>
            <p className="mx-auto mt-2 flex h-6 w-fit max-w-full items-center rounded-lg bg-white px-[18px] text-[11px] leading-[1.6] tracking-[-0.04em] text-[var(--color-text)]" aria-live="polite">
              <span><PackageProgressMessage progress={progress} /></span>
            </p>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-[var(--color-package-divider)] pb-4">
              <h2 className={TITLE}>선택상품</h2>
              <button type="button" onClick={() => setView("summary")} className={SWITCH}>내 패키지<ChevronRight /></button>
            </div>
            <div className={`max-h-[237px] ${PACKAGE_LIST_SCROLL_CLASS}`}>
              <PackageItemList cart={pkg.cart} pendingItemIds={pkg.pendingItemIds} changeQuantity={pkg.changeQuantity} remove={pkg.remove} className="pb-5 pt-5" />
            </div>
            <div className="border-t border-[var(--color-package-divider)] pt-3">
              <PackageShippingRow progress={progress} />
            </div>
          </>
        )}
        <div className={`grid grid-cols-2 gap-[11px] ${view === "items" ? "mt-4" : "mt-5"}`}>
          <button type="button" onClick={handleMore} className={`${BUTTON} border border-[var(--color-cta-button)] bg-white text-[var(--color-cta-button)]`}>상품 더 담기</button>
          <button type="button" onClick={onPurchase} disabled={!canPurchase} className={`${BUTTON} bg-[var(--color-cta-button)] text-white disabled:opacity-40`}>패키지 구매하기</button>
        </div>
      </div>
    </section>
  );
}
