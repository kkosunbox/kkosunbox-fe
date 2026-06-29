"use client";

import { useCallback, useEffect, useRef } from "react";
import { useModal } from "@/shared/ui";
import { unsavedCloseAlertOptions } from "@/shared/lib/modal/alertPresets";

export interface UseUnsavedChangesGuardResult {
  /** 닫기 시도(배경 클릭·X 버튼). dirty면 확인 모달, 아니면 즉시 닫기 */
  handleCloseRequest: () => void;
}

/**
 * 모달 닫기 시도(ESC·배경·X)를 가로채, 미저장 변경이 있으면 확인 AlertModal을 띄운다.
 * - ESC는 캡처 단계에서 가로채 ModalProvider보다 먼저 실행한다.
 * - 확인 모달(z-[210])이 열려 있는 동안에는 ESC를 다시 가로채지 않는다.
 *
 * `isDirty`만 입력으로 받으며, 모달 내 다른 상태 훅(draft/nav/submit)을 참조하지 않는다.
 */
export function useUnsavedChangesGuard({
  isDirty,
  onClose,
}: {
  isDirty: boolean;
  onClose: () => void;
}): UseUnsavedChangesGuardResult {
  const { openAlert } = useModal();

  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  });

  /** 미저장 확인 AlertModal(z-[210])이 열려 있을 때 ESC를 가로채지 않도록 */
  const closeConfirmOpenRef = useRef(false);

  const promptCloseConfirm = useCallback(() => {
    const resetConfirm = () => {
      closeConfirmOpenRef.current = false;
    };
    closeConfirmOpenRef.current = true;
    const opts = unsavedCloseAlertOptions(() => {
      resetConfirm();
      onClose();
    });
    openAlert({
      ...opts,
      onDismiss: resetConfirm,
      onSecondary: () => {
        opts.onSecondary?.();
        resetConfirm();
      },
    });
  }, [openAlert, onClose]);

  /* ESC 처리 — 캡처 단계에서 가로채 ModalProvider보다 먼저 실행 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (closeConfirmOpenRef.current) return;
      e.stopImmediatePropagation();
      if (isDirtyRef.current) {
        promptCloseConfirm();
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [onClose, promptCloseConfirm]);

  const handleCloseRequest = useCallback(() => {
    if (isDirtyRef.current) {
      promptCloseConfirm();
    } else {
      onClose();
    }
  }, [onClose, promptCloseConfirm]);

  return { handleCloseRequest };
}
