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
 *
 * ESC는 별도로 다루지 않는다 — 모달이 네이티브 `<dialog>`이므로 ESC는 top layer 최상단
 * 다이얼로그에만 `cancel`로 전달되고, ModalShell이 그걸 `onClose`(= handleCloseRequest)로
 * 넘겨준다. 확인 AlertModal이 떠 있는 동안에는 그쪽이 최상단이라 ESC가 이 폼까지 오지 않는다.
 * (예전에는 이 순서를 만들려고 window 캡처 단계에서 ESC를 가로채고
 * stopImmediatePropagation으로 ModalProvider를 눌러야 했다.)
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

  const promptCloseConfirm = useCallback(() => {
    openAlert(unsavedCloseAlertOptions(onClose));
  }, [openAlert, onClose]);

  const handleCloseRequest = useCallback(() => {
    if (isDirtyRef.current) {
      promptCloseConfirm();
    } else {
      onClose();
    }
  }, [onClose, promptCloseConfirm]);

  return { handleCloseRequest };
}
