"use client";

import { useState } from "react";
import { useLoadingOverlay, LoadingOverlay } from "@/shared/ui";

export default function LoadingOverlayTestSection() {
  const { showLoading, hideLoading, isLoading } = useLoadingOverlay();
  const [standaloneVisible, setStandaloneVisible] = useState(false);

  function handleShowGlobal(message?: string) {
    showLoading(message);
    setTimeout(() => hideLoading(), 3000);
  }

  function handleShowStandalone() {
    setStandaloneVisible(true);
    setTimeout(() => setStandaloneVisible(false), 3000);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">
        버튼을 누르면 3초간 로딩 오버레이가 표시됩니다.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleShowGlobal()}
          disabled={isLoading}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Global (메시지 없음)
        </button>

        <button
          type="button"
          onClick={() => handleShowGlobal("구독을 처리하고 있습니다...")}
          disabled={isLoading}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Global (메시지 있음)
        </button>

        <button
          type="button"
          onClick={() => handleShowGlobal("카드 정보를 등록하고 있습니다...")}
          disabled={isLoading}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Global (카드 등록)
        </button>

        <button
          type="button"
          onClick={handleShowStandalone}
          disabled={standaloneVisible}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Standalone (prop 방식)
        </button>
      </div>

      <LoadingOverlay visible={standaloneVisible} message="Standalone 로딩 테스트..." />
    </div>
  );
}
