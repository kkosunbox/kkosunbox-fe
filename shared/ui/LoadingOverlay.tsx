"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

/* ── Context ──────────────────────────────────────────────── */

interface LoadingOverlayContextValue {
  /** 로딩 오버레이 표시 (message: 선택적 안내 문구) */
  showLoading: (message?: string) => void;
  /** 로딩 오버레이 숨김 */
  hideLoading: () => void;
  /** 현재 로딩 상태 */
  isLoading: boolean;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(null);

export function useLoadingOverlay() {
  const ctx = useContext(LoadingOverlayContext);
  if (!ctx) throw new Error("useLoadingOverlay must be used within LoadingOverlayProvider");
  return ctx;
}

/* ── Provider ─────────────────────────────────────────────── */

export function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ visible: boolean; message?: string }>({
    visible: false,
  });

  const showLoading = useCallback((message?: string) => {
    setState({ visible: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setState({ visible: false });
  }, []);

  const value = useMemo(
    () => ({ showLoading, hideLoading, isLoading: state.visible }),
    [showLoading, hideLoading, state.visible],
  );

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      {state.visible && typeof document !== "undefined"
        ? createPortal(<LoadingOverlayUI message={state.message} />, document.body)
        : null}
    </LoadingOverlayContext.Provider>
  );
}

/* ── Standalone (Provider 없이 boolean prop으로 사용) ──────── */

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;
  return <LoadingOverlayUI message={message} />;
}

/* ── 내부 UI ──────────────────────────────────────────────── */

function LoadingOverlayUI({ message }: { message?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * top layer로 올린다 — 모달이 네이티브 <dialog>로 넘어가면서 z-index 사다리가 무력화되기
   * 때문이다(top layer는 z-index를 무시한다). 그대로 두면 스피너가 모달 뒤로 숨는다.
   *
   * <dialog>가 아니라 popover를 쓰는 이유:
   *  - role="status" / aria-live 시맨틱을 유지해야 한다(이건 대화상자가 아니다)
   *  - showModal()은 auto 팝오버만 닫는다. manual은 모달이 열려도 살아남는다
   *  - ESC로 닫히지 않는다 (로딩 중엔 닫히면 안 된다)
   *
   * 다만 top layer 순서는 "나중에 연 것이 위"라 항상 최상단은 아니다. 스피너 도중 뜬
   * 에러 알림이 위로 오는 게 맞는 동작이라 수용한다 (계획서 §2-4).
   *
   * popover 미지원 브라우저에선 attribute가 무시되어 기존의 z-[9999] 고정 오버레이로 동작한다.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== "function") return;
    el.showPopover();
    return () => {
      if (el.isConnected && el.matches(":popover-open")) el.hidePopover();
    };
  }, []);

  return (
    /* display 계열 클래스를 여기 두면 안 된다 — 작성자 스타일이 UA의
     * `[popover]:not(:popover-open) { display: none }`을 이겨서 닫힌 상태에서도 보이게 된다.
     * 정렬은 안쪽 div가 맡는다. */
    <div
      ref={ref}
      popover="manual"
      className="fixed inset-0 z-[9999] m-0 h-auto max-h-none w-auto max-w-none border-0 p-0"
      style={{ background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(2px)" }}
      aria-live="assertive"
      role="status"
    >
      <div className="flex h-full flex-col items-center justify-center">
        <PawSpinner />
        {message && (
          <p className="mt-4 text-body-14-sb text-[var(--color-text)]">{message}</p>
        )}
      </div>
    </div>
  );
}

/* ── 발바닥 스피너 ────────────────────────────────────────── */

function PawSpinner() {
  return (
    <div className="relative" style={{ width: 56, height: 56 }}>
      <style>{`
        @keyframes paw-spin {
          0%   { opacity: 0.25; }
          25%  { opacity: 1;    }
          50%  { opacity: 0.25; }
          100% { opacity: 0.25; }
        }
        .paw-toe-1 { animation: paw-spin 1.2s ease-in-out 0s infinite; }
        .paw-toe-2 { animation: paw-spin 1.2s ease-in-out 0.15s infinite; }
        .paw-toe-3 { animation: paw-spin 1.2s ease-in-out 0.3s infinite; }
        .paw-toe-4 { animation: paw-spin 1.2s ease-in-out 0.45s infinite; }
        .paw-pad   { animation: paw-spin 1.2s ease-in-out 0.6s infinite; }
      `}</style>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <ellipse className="paw-pad" cx="12" cy="15.5" rx="5" ry="4" fill="var(--color-primary)" />
        <ellipse className="paw-toe-1" cx="6.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse className="paw-toe-2" cx="10" cy="8.5" rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse className="paw-toe-3" cx="14" cy="8.5" rx="2" ry="2.5" fill="var(--color-primary)" />
        <ellipse className="paw-toe-4" cx="17.5" cy="10.5" rx="2" ry="2.5" fill="var(--color-primary)" />
      </svg>
    </div>
  );
}
