"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BREAKPOINT_MD_PX, BREAKPOINT_LG_PX } from "@/shared/config/breakpoints";
import type { PackageTier } from "./packageData";

/**
 * 왼쪽 설명 패널 ↔ 선택된 요약 카드를 하나의 흰색 배경으로 잇는 SVG path를 계산한다.
 *
 * PackagePlansSection(home)·SubscribePlansSection(/subscribe)에서 동일하게 사용되는
 * 브릿지 로직을 공용화한 훅. 두 컴포넌트는 디자인이 의도적으로 갈라지는 부분(노출 순서,
 * 데이터 소스, 뱃지/회전 등)만 각자 유지하고, 이 기하 계산은 한 곳에서 관리한다.
 *
 * 반환된 ref들을 컨테이너/왼쪽 패널/카드 컬럼·카드 버튼에 그대로 연결하면 된다.
 *
 * @param order   요약 카드 노출 순서 (PACKAGE_SUMMARY_ORDER) — `displayTier`의 인덱스 계산에 사용
 * @param displayTier 현재 왼쪽 패널에 표시 중인 티어 (선택 또는 자동 회전 결과)
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
  // 태블릿(768-1199px) 전용 — 하단 가로 배치 카드 refs
  const tabletCardColumnRef = useRef<HTMLDivElement>(null);
  const tabletCardRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null]);
  const [svgBg, setSvgBg] = useState<SvgBgData>(null);

  const updateSvgBg = useCallback(() => {
    const container = containerRef.current;
    const leftPanel = leftPanelRef.current;
    if (!container || !leftPanel) { setSvgBg(null); return; }

    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    if (vw < BREAKPOINT_MD_PX) { setSvgBg(null); return; } // 모바일 — SVG 미사용

    const tierIndex = order.indexOf(displayTier);
    const cRect = container.getBoundingClientRect();
    const lpRect = leftPanel.getBoundingClientRect();
    if (lpRect.width < 10) { setSvgBg(null); return; }

    const R = 24;
    const FLUSH_THRESHOLD = R;

    if (vw < BREAKPOINT_LG_PX) {
      // ── 태블릿 — 상단 패널 ↔ 하단 선택 카드 수직 연결 ──
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

      // 선택 카드가 행의 좌/우 끝에 붙어있을 때만 직선(평평) 처리
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
        path: parts.join(' '),
      });
      return;
    }

    // ── 데스크탑 — 왼쪽 패널 ↔ 우측 선택 카드 가로 연결 ──
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

    // 카드가 패널 상단/하단 끝에 붙어있을 때만 직선(평평) 처리
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
      path: parts.join(' '),
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
  };
}
