"use client";

import { useEffect, useRef } from "react";

/**
 * 카드 등록/변경 완료를 같은 오리진의 다른 창·탭에 알린다.
 *
 * 실제 카드 인증은 카드사 앱·새 창을 거치면서 `window.opener` 연결이 끊기는 경우가 있어
 * 팝업 → 부모 postMessage만으로는 마이페이지가 갱신되지 않는다. BroadcastChannel은
 * opener 관계와 무관하게 같은 오리진의 모든 문서에 전달되므로 이를 주 경로로 쓴다.
 *
 * 수신 측은 이 신호를 받으면 메시지에 실린 값을 믿지 말고 `router.refresh()`로
 * 서버에서 최신 BillingInfo를 다시 조회한다(서버가 유일한 진실).
 */

const CHANNEL_NAME = "kkosunbox:billing";
const STORAGE_KEY = "kkosunbox:billing-updated-at";
const MESSAGE = "billing-updated";

/** 카드 등록/변경이 완료됐음을 브로드캐스트한다. */
export function notifyBillingUpdated(): void {
  if (typeof window === "undefined") return;

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(MESSAGE);
    channel.close();
  }

  // BroadcastChannel 미지원 환경 폴백. storage 이벤트는 값이 바뀔 때 다른 탭에서만 발생한다.
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // 프라이빗 모드 등 localStorage 차단 환경 — 폴백 없이 넘어간다.
  }
}

/** 다른 창에서 카드가 등록/변경되면 onUpdated를 호출한다. */
export function useBillingUpdated(onUpdated: () => void): void {
  // 매 렌더마다 새 콜백이 들어와도 구독을 다시 만들지 않도록 ref로 최신 값만 갱신한다.
  const handlerRef = useRef(onUpdated);
  useEffect(() => {
    handlerRef.current = onUpdated;
  }, [onUpdated]);

  useEffect(() => {
    const channel =
      typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;

    if (channel) {
      channel.onmessage = (e: MessageEvent) => {
        if (e.data === MESSAGE) handlerRef.current();
      };
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) handlerRef.current();
    }
    window.addEventListener("storage", handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
}
