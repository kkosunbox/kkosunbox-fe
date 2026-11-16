"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { trackEvent } from "@/shared/lib/analytics";
import woonpickBackground from "@/shared/assets/woonpick/background.webp";
import woonpickPets from "@/shared/assets/woonpick/pets.webp";
import woonpickGlow from "@/shared/assets/woonpick/glow.svg";
import woonpickLogoMascot from "@/shared/assets/woonpick/logo-mascot.webp";
import logo0 from "@/shared/assets/woonpick/logo-0.svg";
import logo1 from "@/shared/assets/woonpick/logo-1.svg";
import logo2 from "@/shared/assets/woonpick/logo-2.svg";
import logo3 from "@/shared/assets/woonpick/logo-3.svg";
import logo4 from "@/shared/assets/woonpick/logo-4.svg";
import logo5 from "@/shared/assets/woonpick/logo-5.svg";
import logo6 from "@/shared/assets/woonpick/logo-6.svg";
import logo7 from "@/shared/assets/woonpick/logo-7.svg";
import styles from "./WoonpickBanner.module.css";
import woonpickSideRail from "@/shared/assets/woonpick-side-rail.webp";
import woonpickClose from "@/shared/assets/woonpick-close.svg";

/** 운Pick 광고 노출 위치 — UTM `utm_content`와 GA 이벤트 `placement`에 그대로 쓰인다. */
export type WoonpickPlacement = "side_rail" | "checklist_result" | "order_complete" | "guest_order_complete" | "mypage";

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

// Figma 로고의 벡터 원본을 원래 좌표로 조립하고, 로고 전체만 비율에 맞춰 확대한다.
const LOGO_PARTS = [
  { src: logo0, x: 24.3692, y: 11.1847, width: 6.10528, height: 7.09258 },
  { src: logo1, x: 9.1385, y: 11.1696, width: 5.775, height: 6.88081 },
  { src: logo2, x: 18.2769, y: 11.1696, width: 5.64784, height: 7.02896 },
  { src: logo3, x: 0.5077, y: 9.6466, width: 7.18228, height: 3.5173 },
  { src: logo4, x: 0, y: 13.7066, width: 8.0774, height: 2.55288 },
  { src: logo5, x: 15.7385, y: 11.032, width: 1.99321, height: 7.24416 },
  { src: logo6, x: 0.5077, y: 15.7347, width: 7.09616, height: 2.54258 },
  { src: logo7, x: 21.9813, y: 0, width: 11.0186, height: 10.1538 },
];

/** Figma 6311:7785 — 배경과 로고·문구·캐릭터를 분리한 반응형 가로 배너. */
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
      className={`${styles.inlineBanner} ${className}`}
      data-woonpick-placement={placement}
    >
      <div className={styles.inlineContent}>
        <div className={styles.glow} aria-hidden="true">
          <Image src={woonpickGlow} alt="" width={610} height={610} />
        </div>
        <div className={styles.background} aria-hidden="true">
          <Image src={woonpickBackground} alt="" width={721} height={377} sizes="(max-width: 520px) 721px, 1082px" className={styles.backgroundImage} />
        </div>
        <div className={styles.copy}>
          <div className={styles.logoSlot} aria-hidden="true">
            <div className={styles.logo}>
              {LOGO_PARTS.map(({ src, x, y, width, height }, index) => (
                <Image key={index} src={src} alt="" width={width} height={height} className={styles.logoPart} style={{ left: x, top: y }} />
              ))}
              <Image src={woonpickLogoMascot} alt="" width={10.5541} height={9.7453} className={styles.logoPart} style={{ left: 21.8308, top: 0 }} />
            </div>
          </div>
          <strong className={styles.title}><span>나와 댕냥이와의</span>{" "}<span>궁합은 몇점?</span></strong>
          <span className={styles.cta}>반려동물 궁합보기 →</span>
        </div>
        <Image src={woonpickPets} alt="" aria-hidden="true" width={113} height={113} sizes="(max-width: 520px) 113px, 170px" className={styles.pets} />
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

  const hasInlineBanner = pathname === "/mypage"
    || pathname === "/purchase/order/success"
    || pathname === "/purchase/guest-order/success";

  if (dismissed || hasInlineBanner || pathname === "/" || pathname === "/about" || pathname.startsWith("/about/")) {
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
        className="block overflow-hidden rounded-[16px] shadow-[0_8px_24px_var(--color-woonpick-cta-shadow)]"
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
        className="absolute -right-[13px] -top-4 flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-woonpick-navy)]"
      >
        <Image src={woonpickClose} alt="" width={24} height={24} aria-hidden="true" />
      </button>
    </aside>
  );
}
