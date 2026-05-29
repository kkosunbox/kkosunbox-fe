import type { AlertModalOptions } from "@/shared/ui/modal/AlertModal";

/** 페이지 이탈 시 미저장 경고 (AlertModal contents 타입) */
export function unsavedLeaveAlertOptions(onLeave: () => void): AlertModalOptions {
  return {
    type: "contents",
    title: "작성중인 내용이 있습니다!",
    description:
      "페이지를 나가면 입력하신 정보가\n저장되지 않고 사라집니다.\n정말 이동하시겠습니까?",
    primaryLabel: "계속 작성하기",
    secondaryLabel: "나가기",
    onSecondary: onLeave,
  };
}

/** 모달/폼 닫기 시 미저장 경고 */
export function unsavedCloseAlertOptions(onClose: () => void): AlertModalOptions {
  return {
    type: "contents",
    title: "작성중인 내용이 있습니다!",
    description: "닫으면 지금까지 작성한\n내용이 저장되지 않아요.",
    primaryLabel: "계속 작성하기",
    secondaryLabel: "닫기",
    onSecondary: onClose,
  };
}

/** 삭제 확인 (primary: 삭제, secondary: 취소) */
export function deleteConfirmAlertOptions(
  title: string,
  onDelete: () => void,
  description?: string,
): AlertModalOptions {
  return {
    type: "alert",
    title,
    description,
    primaryLabel: "삭제하기",
    secondaryLabel: "취소",
    onPrimary: onDelete,
  };
}
