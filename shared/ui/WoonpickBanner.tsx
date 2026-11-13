"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { trackEvent } from "@/shared/lib/analytics";
import woonpickBadge from "@/shared/assets/woonpick-badge.webp";
import woonpickSideRail from "@/shared/assets/woonpick-side-rail.webp";
import woonpickClose from "@/shared/assets/woonpick-close.svg";

/** 운Pick 광고 노출 위치 — UTM `utm_content`와 GA 이벤트 `placement`에 그대로 쓰인다. */
export type WoonpickPlacement = "side_rail" | "checklist_result" | "order_complete";

const WOONPICK_URL = "https://woonpick.com";
const RAIL_DISMISS_KEY = "woonpick-side-rail-dismissed";

function buildWoonpickHref(placement: WoonpickPlacement): string {
  const params = new URLSearchParams({
    utm_source: "kkosunbox",
    utm_medium: "banner",
    utm_campaign: "pet_compatibility",
    utm_content: placement,
  });
  return `${WOONPICK_URL}/?${params.toString()}`;
}

function trackWoonpickClick(placement: WoonpickPlacement) {
  trackEvent("woonpick_banner_click", { placement });
}

/**
 * 운Pick 반려동물 궁합 광고 — 페이지 본문용 가로 카드 (모바일·데스크탑 공용).
 * 원형 배지 시안(Figma 6262:14995)을 좌측에 두고 우측에 카피·CTA를 배치한다.
 */
export function WoonpickInlineBanner({
  placement,
  className = "",
}: {
  placement: Exclude<WoonpickPlacement, "side_rail">;
  className?: string;
}) {
  return (
    <a
      href={buildWoonpickHref(placement)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackWoonpickClick(placement)}
      aria-label="운Pick에서 반려동물 궁합보기 (새 창)"
      className={`group flex items-center gap-5 overflow-hidden rounded-[20px] px-6 py-5 transition-opacity hover:opacity-95 max-md:gap-4 max-md:px-4 max-md:py-4 ${className}`}
      style={{ background: "var(--gradient-woonpick-banner)" }}
    >
      <Image
        src={woonpickBadge}
        alt=""
        aria-hidden="true"
        width={120}
        height={117}
        className="h-auto w-[120px] shrink-0 max-md:w-[88px]"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-body-13-m text-[var(--color-woonpick-navy-soft)]">
          성격, 행동으로 알아보는 궁합
        </span>
        <strong className="text-[22px] font-extrabold leading-[1.3] tracking-[-0.04em] text-white [text-shadow:0_1px_6px_var(--color-woonpick-cta-shadow)] max-md:text-[18px]">
          우리 아이와 나,<br className="md:hidden" />{" "}
          <span className="whitespace-nowrap text-[var(--color-woonpick-navy)]">어떤 사이일까?</span>
        </strong>
        <span className="mt-2 inline-flex items-center whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-body-14-sb text-[var(--color-woonpick-navy)] shadow-[0_4px_16px_var(--color-woonpick-cta-shadow)] transition-transform group-hover:translate-x-0.5 max-md:mt-1.5 max-md:px-3 max-md:py-1">
          운PICK에서 궁합보기 →
        </span>
      </div>
    </a>
  );
}

function readRailDismissed(): boolean {
  try {
    return sessionStorage.getItem(RAIL_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * 운Pick 광고 — 와이드 데스크탑(≥1760px) 우측 빈 영역 고정 날개 배너.
 * 본문(최대 1240px) 바깥에 24px 간격으로 배치하고, 지정된 콘텐츠 박스 상단에 정렬한다.
 * 홈·소개에서는 노출하지 않으며, 닫으면 세션 동안 숨긴다.
 */
export function WoonpickSideRail() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);
  const railRef = useRef<HTMLElement>(null);

  // sessionStorage는 클라이언트에서만 읽을 수 있어 마운트 후 동기화한다(SSR에서는 숨김으로 시작).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDismissed(readRailDismissed()), []);

  useLayoutEffect(() => {
    const rail = railRef.current;
    const anchor = document.querySelector<HTMLElement>("[data-woonpick-rail-anchor]");
    if (!rail || !anchor) return;

    const update = () => {
      rail.style.setProperty("--woonpick-rail-anchor", `${anchor.getBoundingClientRect().top}px`);
    };
    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);
    observer.observe(anchor);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      rail.style.removeProperty("--woonpick-rail-anchor");
    };
  }, [pathname, dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(RAIL_DISMISS_KEY, "1");
    } catch {
      // 저장 불가 환경에서도 현재 화면에서는 닫힌 상태를 유지한다.
    }
  };

  if (dismissed || pathname === "/" || pathname === "/about" || pathname.startsWith("/about/")) {
    return null;
  }

  return (
    <aside
      ref={railRef}
      aria-label="광고"
      className="fixed left-[calc(50%_+_644px)] top-[max(calc(var(--header-offset)_+_24px),var(--woonpick-rail-anchor,calc(var(--header-offset)_+_104px)))] z-40 w-[207px] max-[1760px]:hidden"
    >
      <a
        href={buildWoonpickHref("side_rail")}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackWoonpickClick("side_rail")}
        className="block overflow-hidden rounded-[16px] shadow-[0_8px_24px_var(--color-woonpick-cta-shadow)] transition-transform hover:-translate-y-0.5"
      >
        <Image
          src={woonpickSideRail}
          alt="댕냥이와 나, 어떤 사이일까? 운PICK에서 반려동물 궁합 확인하기"
          width={207}
          height={387}
          sizes="207px"
          className="h-auto w-full"
        />
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="운Pick 광고 닫기"
        className="absolute -right-[13px] -top-4 flex size-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-woonpick-navy)]"
      >
        <Image src={woonpickClose} alt="" width={24} height={24} aria-hidden="true" />
      </button>
    </aside>
  );
}
