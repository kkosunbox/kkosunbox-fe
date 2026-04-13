"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
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
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(2px)" }}
      aria-live="assertive"
      role="status"
    >
      <PawSpinner />
      {message && (
        <p className="mt-4 text-body-14-sb text-[var(--color-text)]">{message}</p>
      )}
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
