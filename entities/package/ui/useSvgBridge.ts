"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BREAKPOINT_MD_PX, BREAKPOINT_LG_PX } from "@/shared/config/breakpoints";
import type { PackageTier } from "../lib/packageData";

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
    const cRect = container.getBoundingClientRect();
    const lpRect = leftPanel.getBoundingClientRect();
    if (lpRect.width < 10) { setSvgBg(null); return; }

    const R = 24;
    const FLUSH_THRESHOLD = R;

    if (vw < BREAKPOINT_LG_PX) {
      const cardColumn = tabletCardColumnRef.current;
      const card = tabletCardRefs.current[tierIndex];
      if (!cardColumn || !card) { setSvgBg(null); return; }

      const cardRect = card.getBoundingClientRect();
      const pW = lpRect.width;
      const pH = lpRect.height;

      const gapH = cardRect.top - lpRect.bottom;
      if (gapH < 0) { setSvgBg(null); return; }

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

    const cardRect = card.getBoundingClientRect();
    const colRect = cardColumn.getBoundingClientRect();

    const gapWidth = colRect.left - lpRect.right;
    if (gapWidth < 4) { setSvgBg(null); return; }

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
