/**
 * 팝업 창을 **현재 창이 놓인 모니터** 기준 중앙에 연다.
 *
 * `window.open`의 features에 `left`/`top`을 넘기지 않으면 브라우저가 위치를 정한다 —
 * 크롬은 직전에 열렸던 팝업 자리에 계단식으로 띄운다. 팝업이 중앙에 뜨는 서비스는 예외 없이
 * 좌표를 직접 계산해 넘기는 것이고, 브라우저 기본값이 중앙인 경우는 없다.
 *
 * 좌표를 `screen.width`가 아니라 `window.screenLeft`/`outerWidth`에서 뽑는 이유:
 * `screen.*`는 주모니터 기준이라, 브라우저가 보조 모니터에 있으면 팝업만 주모니터로 날아간다.
 */

export interface PopupSize {
  width: number;
  height: number;
}

export interface PopupPosition {
  left: number;
  top: number;
}

interface CenterInput extends PopupSize {
  /** 현재 창이 놓인 모니터의 좌측 오프셋 (window.screenLeft) */
  dualLeft: number;
  /** 현재 창이 놓인 모니터의 상단 오프셋 (window.screenTop) */
  dualTop: number;
  /** 현재 창의 바깥 너비 (window.outerWidth) */
  viewWidth: number;
  /** 현재 창의 바깥 높이 (window.outerHeight) */
  viewHeight: number;
}

/**
 * 중앙 좌표 계산 (순수 함수 — 단위 테스트 대상).
 *
 * **결과를 0으로 클램프하면 안 된다.** 다중 모니터에서 주모니터 왼쪽·위에 놓인 모니터는
 * 화면 좌표가 음수다(예: 왼쪽 모니터는 `availLeft: -1920`). 0으로 자르면 그 모니터를 쓰는
 * 사용자에게 팝업이 주모니터 가장자리로 튀어나간다 — 중앙 정렬이 가장 크게 깨지는 경우다.
 */
export function computeCenteredPosition({
  dualLeft,
  dualTop,
  viewWidth,
  viewHeight,
  width,
  height,
}: CenterInput): PopupPosition {
  return {
    left: Math.round(dualLeft + (viewWidth - width) / 2),
    top: Math.round(dualTop + (viewHeight - height) / 2),
  };
}

/**
 * 중앙 좌표. 브라우저 밖(SSR)에서는 0,0을 돌려준다.
 *
 * 기준은 두 가지다.
 * 1. `outerWidth`/`outerHeight`를 읽을 수 있으면 **현재 창** 중앙 — 창을 반만 띄워 쓰는 사용자에게 자연스럽다.
 * 2. 못 읽으면(백그라운드 탭 등에서 0으로 나오는 경우가 있다) **화면**(작업표시줄 제외) 중앙.
 *    이때 뷰포트(`clientWidth/clientHeight`)로 대체하면 안 된다 — 브라우저 크롬 높이와 창의
 *    화면상 위치가 통째로 빠져 팝업이 실제 중앙보다 100px 가까이 위로 치우친다.
 */
export function getCenteredPopupPosition(size: PopupSize): PopupPosition {
  if (typeof window === "undefined") return { left: 0, top: 0 };

  const outerWidth = window.outerWidth;
  const outerHeight = window.outerHeight;

  if (outerWidth > 0 && outerHeight > 0) {
    return computeCenteredPosition({
      ...size,
      dualLeft: window.screenLeft ?? window.screenX ?? 0,
      dualTop: window.screenTop ?? window.screenY ?? 0,
      viewWidth: outerWidth,
      viewHeight: outerHeight,
    });
  }

  // availLeft/availTop은 비표준이지만 크롬·파이어폭스가 지원한다. 없으면 주모니터로 간주.
  const screen = window.screen as Screen & { availLeft?: number; availTop?: number };
  return computeCenteredPosition({
    ...size,
    dualLeft: screen.availLeft ?? 0,
    dualTop: screen.availTop ?? 0,
    viewWidth: screen.availWidth || screen.width,
    viewHeight: screen.availHeight || screen.height,
  });
}

/**
 * 중앙 정렬된 팝업을 연다.
 *
 * @param extraFeatures `window.open` features에 덧붙일 항목. 기본값은 기존 팝업들과 동일한 `scrollbars=yes`.
 */
export function openCenteredPopup(
  url: string,
  name: string,
  size: PopupSize,
  extraFeatures = "scrollbars=yes",
): Window | null {
  if (typeof window === "undefined") return null;

  const { left, top } = getCenteredPopupPosition(size);
  const features = [
    `width=${size.width}`,
    `height=${size.height}`,
    `left=${left}`,
    `top=${top}`,
    extraFeatures,
  ]
    .filter(Boolean)
    .join(",");

  return window.open(url, name, features);
}
