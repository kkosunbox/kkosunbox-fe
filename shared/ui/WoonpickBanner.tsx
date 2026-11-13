"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackEvent } from "@/shared/lib/analytics";
import woonpickBadge from "@/shared/assets/woonpick-badge.webp";
import woonpickSideRail from "@/shared/assets/woonpick-side-rail.webp";

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

/** 홈은 전체 폭 히어로를 덮지 않도록 히어로를 지나간 뒤부터 노출한다. */
function useRailScrollGate(isHome: boolean): boolean {
  const [passedHero, setPassedHero] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const update = () => setPassedHero(window.scrollY > window.innerHeight * 0.7);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);
  return !isHome || passedHero;
}

/**
 * 운Pick 광고 — 와이드 데스크탑(≥1680px) 우측 빈 영역 고정 날개 배너.
 * 본문 컨테이너(최대 1240px) 오른쪽 바깥에 붙어 콘텐츠를 가리지 않는다. 닫으면 세션 동안 숨긴다.
 */
export function WoonpickSideRail() {
  const isHome = usePathname() === "/";
  const scrollReady = useRailScrollGate(isHome);
  const [dismissed, setDismissed] = useState(true);

  // sessionStorage는 클라이언트에서만 읽을 수 있어 마운트 후 동기화한다(SSR에서는 숨김으로 시작).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDismissed(readRailDismissed()), []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(RAIL_DISMISS_KEY, "1");
    } catch {
      // 저장 불가 환경에서도 현재 화면에서는 닫힌 상태를 유지한다.
    }
  };

  const visible = !dismissed && scrollReady;

  return (
    <aside
      aria-label="광고"
      className={`fixed left-[calc(50%_+_644px)] top-[calc(var(--header-offset)_+_24px)] z-40 hidden w-[180px] transition-opacity duration-300 min-[1680px]:block ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <a
        href={buildWoonpickHref("side_rail")}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackWoonpickClick("side_rail")}
        tabIndex={visible ? 0 : -1}
        className="block overflow-hidden rounded-[16px] shadow-[0_8px_24px_var(--color-woonpick-cta-shadow)] transition-transform hover:-translate-y-0.5"
      >
        <Image
          src={woonpickSideRail}
          alt="댕냥이와 나, 어떤 사이일까? 운PICK에서 반려동물 궁합 확인하기"
          width={180}
          height={337}
          className="h-auto w-full"
        />
      </a>
      <button
        type="button"
        onClick={dismiss}
        tabIndex={visible ? 0 : -1}
        className="mt-2 w-full text-center text-body-13-m text-[var(--color-text-secondary)] hover:underline"
      >
        닫기
      </button>
    </aside>
  );
}
