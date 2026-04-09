import type { AlertModalOptions } from "./AlertModal";

type Listener = (options: AlertModalOptions | null) => void;

let listener: Listener | null = null;

/** ModalProvider가 구독하는 내부 스토어 */
export const alertStore = {
  subscribe(fn: Listener) {
    listener = fn;
    return () => { listener = null; };
  },

  emit(options: AlertModalOptions | null) {
    listener?.(options);
  },
};

/**
 * React 외부(API 레이어, 유틸 등)에서 알림 모달을 여는 함수.
 * ModalProvider가 마운트되어 있어야 동작한다.
 */
export function openAlertModal(options: AlertModalOptions) {
  alertStore.emit(options);
}
