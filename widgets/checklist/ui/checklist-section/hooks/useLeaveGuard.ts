"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/shared/ui";
import { unsavedLeaveAlertOptions } from "@/shared/lib/modal/alertPresets";

export interface UseLeaveGuardResult {
  /** 제출 등 의도된 이탈 시 가드를 통과시키기 위한 플래그 ref */
  isConfirmedLeaveRef: RefObject<boolean>;
}

/**
 * 미저장 변경(isDirty)이 있을 때 페이지 이탈을 가로채 확인 모달을 띄운다.
 * - beforeunload: 새로고침 / 탭 닫기
 * - 앵커 클릭 캡처: 내부 링크 이동
 * - history.pushState 몽키패치: router.push 등 프로그램적 이동
 * - popstate: 뒤로가기
 *
 * `isDirty`만 입력으로 받으며, isConfirmedLeaveRef를 노출해 제출 등 의도된 이탈은
 * 호출부가 통과시킬 수 있게 한다.
 */
export function useLeaveGuard({
  isDirty,
}: {
  isDirty: boolean;
}): UseLeaveGuardResult {
  const router = useRouter();
  const { openAlert } = useModal();

  const isDirtyRef = useRef(isDirty);
  const isConfirmedLeaveRef = useRef(false);
  const pendingNavigateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  });

  const clearPendingLeave = useCallback(() => {
    pendingNavigateRef.current = null;
  }, []);

  const promptLeaveConfirm = useCallback(() => {
    openAlert({
      ...unsavedLeaveAlertOptions(() => {
        const navigate = pendingNavigateRef.current;
        pendingNavigateRef.current = null;
        navigate?.();
      }),
      onDismiss: clearPendingLeave,
    });
  }, [openAlert, clearPendingLeave]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isDirtyRef.current || isConfirmedLeaveRef.current) return;
      const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
      } catch {
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      const targetHref = anchor.href;
      pendingNavigateRef.current = () => {
        isConfirmedLeaveRef.current = true;
        router.push(targetHref);
      };
      promptLeaveConfirm();
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [router, promptLeaveConfirm]);

  useEffect(() => {
    const original = window.history.pushState.bind(window.history);
    window.history.pushState = function (
      state: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      if (isDirtyRef.current && !isConfirmedLeaveRef.current && url != null) {
        try {
          const targetPath = new URL(url.toString(), window.location.origin).pathname;
          if (targetPath !== window.location.pathname) {
            const targetUrl = url.toString();
            pendingNavigateRef.current = () => {
              isConfirmedLeaveRef.current = true;
              router.push(targetUrl);
            };
            promptLeaveConfirm();
            return;
          }
        } catch {
          /* ignore */
        }
      }
      original(state, unused, url);
    };
    return () => {
      window.history.pushState = original;
    };
  }, [router, promptLeaveConfirm]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handler = () => {
      if (!isDirtyRef.current || isConfirmedLeaveRef.current) return;
      window.history.pushState(null, "", window.location.href);
      pendingNavigateRef.current = () => {
        isConfirmedLeaveRef.current = true;
        window.history.go(-2);
      };
      promptLeaveConfirm();
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [promptLeaveConfirm]);

  return { isConfirmedLeaveRef };
}
