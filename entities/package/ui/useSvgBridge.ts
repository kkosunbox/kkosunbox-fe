"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BREAKPOINT_MD_PX, BREAKPOINT_LG_PX } from "@/shared/config/breakpoints";
import type { PackageTier } from "../lib/packageData";

/** getBoundingClientRect를 정수 px로 반올림 — 브라우저 줌·디스플레이 배율에 따른 서브픽셀 오차로
 * flush 판정 임계값(디자인상 0px/4px와 정확히 맞닿아 있음)이 흔들리는 것을 방지한다. */
function roundedRect(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return {
    top: Math.round(r.top),
    left: Math.round(r.left),
    right: Math.round(r.right),
    bottom: Math.round(r.bottom),
    width: Math.round(r.width),
    height: Math.round(r.height),
  };
}

/**
 * 왼쪽 설명 패널 ↔ 선택된 요약 카드를 하나의 흰색 배경으로 잇는 SVG path를 계산한다.
 *
 * PackagePlansSection(home)·SubscribePlansSection(/subscribe)에서 동일하게 사용되는
 * 브릿지 로직을 공용화한 훅.
 */
export function useSvgBridge(order: PackageTier[], displayTier: PackageTier) {
  type SvgBgData = {
    left: number;
    top: number;
    width: number;
    height: number;
    path: string;
  } | null;

  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const cardColumnRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null]);
  const tabletCardColumnRef = useRef<HTMLDivElement>(null);
  const tabletCardRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null]);
  const [svgBg, setSvgBg] = useState<SvgBgData>(null);

  const updateSvgBg = useCallback(() => {
    const container = containerRef.current;
    const leftPanel = leftPanelRef.current;
    if (!container || !leftPanel) { setSvgBg(null); return; }

    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    if (vw < BREAKPOINT_MD_PX) { setSvgBg(null); return; }

    const tierIndex = order.indexOf(displayTier);
    const cRect = roundedRect(container);
    const lpRect = roundedRect(leftPanel);
    if (lpRect.width < 10) { setSvgBg(null); return; }

    const R = 24;
    const FLUSH_THRESHOLD = R;

    if (vw < BREAKPOINT_LG_PX) {
      const cardColumn = tabletCardColumnRef.current;
      const card = tabletCardRefs.current[tierIndex];
      if (!cardColumn || !card) { setSvgBg(null); return; }

      const cardRect = roundedRect(card);
      const pW = lpRect.width;
      const pH = lpRect.height;

      const gapH = cardRect.top - lpRect.bottom;
      // 디자인상 선택된 카드는 패널 바로 아래 0px로 맞닿음 — 서브픽셀 오차 허용치로 -2px까지 통과
      if (gapH < -2) { setSvgBg(null); return; }

      const cl = cardRect.left - lpRect.left;
      const cr = cardRect.right - lpRect.left;
      const cb = cardRect.bottom - lpRect.top;
      const totalW = pW;
      const totalH = cb;

      const isLeftFlush = cl <= FLUSH_THRESHOLD;
      const isRightFlush = cr >= pW - FLUSH_THRESHOLD;

      const parts: string[] = [];
      parts.push(`M ${R} 0`);
      parts.push(`L ${pW - R} 0`);
      parts.push(`a ${R} ${R} 0 0 1 ${R} ${R}`);

      if (isRightFlush) {
        parts.push(`L ${pW} ${cb - R}`);
        parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
      } else {
        parts.push(`L ${pW} ${pH - R}`);
        parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
        parts.push(`L ${cr + R} ${pH}`);
        parts.push(`a ${R} ${R} 0 0 0 ${-R} ${R}`);
        parts.push(`L ${cr} ${cb - R}`);
        parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
      }

      parts.push(`L ${cl + R} ${cb}`);
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${-R}`);

      if (isLeftFlush) {
        parts.push(`L 0 ${R}`);
        parts.push(`a ${R} ${R} 0 0 1 ${R} ${-R}`);
      } else {
        parts.push(`L ${cl} ${pH + R}`);
        parts.push(`a ${R} ${R} 0 0 0 ${-R} ${-R}`);
        parts.push(`L ${R} ${pH}`);
        parts.push(`a ${R} ${R} 0 0 1 ${-R} ${-R}`);
        parts.push(`L 0 ${R}`);
        parts.push(`a ${R} ${R} 0 0 1 ${R} ${-R}`);
      }
      parts.push(`Z`);

      setSvgBg({
        left: lpRect.left - cRect.left,
        top: lpRect.top - cRect.top,
        width: totalW,
        height: totalH,
        path: parts.join(" "),
      });
      return;
    }

    const cardColumn = cardColumnRef.current;
    if (!cardColumn) { setSvgBg(null); return; }
    const card = cardRefs.current[tierIndex];
    if (!card) { setSvgBg(null); return; }

    const cardRect = roundedRect(card);
    const colRect = roundedRect(cardColumn);

    const gapWidth = colRect.left - lpRect.right;
    // 디자인상 패널-카드 열 사이 간격은 gap-1(4px) — 서브픽셀 오차 허용치로 1px 미만일 때만 flush로 판정
    if (gapWidth < 1) { setSvgBg(null); return; }

    const lpW = lpRect.width;
    const lpH = lpRect.height;
    const cardH = cardRect.height;
    const cardLocalTop = cardRect.top - lpRect.top;
    const cardLocalBottom = cardLocalTop + cardH;
    const totalW = colRect.right - lpRect.left;
    const totalH = Math.max(lpH, cardLocalBottom);

    const isTopFlush = cardLocalTop <= FLUSH_THRESHOLD;
    const isBottomFlush = cardLocalBottom >= lpH - FLUSH_THRESHOLD;

    const parts: string[] = [];

    if (isTopFlush) {
      parts.push(`M ${R} 0`);
      parts.push(`L ${totalW - R} 0`);
      parts.push(`a ${R} ${R} 0 0 1 ${R} ${R}`);
    } else {
      parts.push(`M ${R} 0`);
      parts.push(`L ${lpW - R} 0`);
      parts.push(`a ${R} ${R} 0 0 1 ${R} ${R}`);
      parts.push(`L ${lpW} ${cardLocalTop - R}`);
      parts.push(`a ${R} ${R} 0 0 0 ${R} ${R}`);
      parts.push(`L ${totalW - R} ${cardLocalTop}`);
      parts.push(`a ${R} ${R} 0 0 1 ${R} ${R}`);
    }

    parts.push(`L ${totalW} ${cardLocalBottom - R}`);

    if (isBottomFlush) {
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
      parts.push(`L ${R} ${totalH}`);
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${-R}`);
    } else {
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
      parts.push(`L ${lpW + R} ${cardLocalBottom}`);
      parts.push(`a ${R} ${R} 0 0 0 ${-R} ${R}`);
      parts.push(`L ${lpW} ${lpH - R}`);
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
      parts.push(`L ${R} ${lpH}`);
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${-R}`);
    }

    parts.push(`L 0 ${R}`);
    parts.push(`a ${R} ${R} 0 0 1 ${R} ${-R}`);
    parts.push(`Z`);

    setSvgBg({
      left: lpRect.left - cRect.left,
      top: lpRect.top - cRect.top,
      width: totalW,
      height: totalH,
      path: parts.join(" "),
    });
  }, [order, displayTier]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(() => { updateSvgBg(); }, [updateSvgBg]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateSvgBg);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateSvgBg]);

  return {
    containerRef,
    leftPanelRef,
    cardColumnRef,
    cardRefs,
    tabletCardColumnRef,
    tabletCardRefs,
    svgBg,
    /** 레이아웃 애니메이션 완료 후 외부에서 재측정을 요청할 때 사용 */
    refreshBridge: updateSvgBg,
  };
}
