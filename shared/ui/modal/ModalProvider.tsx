"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import ChecklistRecommendModal from "../custom-modals/ChecklistRecommendModal";
import PlanChangeModal from "../custom-modals/PlanChangeModal";
import ChecklistDeferModal from "../custom-modals/ChecklistDeferModal";
import CouponIssuedModal from "../custom-modals/CouponIssuedModal";
import SubscriptionCancelModal from "../custom-modals/SubscriptionCancelModal";
import SubscriptionRestartModal from "../custom-modals/SubscriptionRestartModal";
import MemberWithdrawModal from "../custom-modals/MemberWithdrawModal";
import ProfileSwitchModal from "../custom-modals/ProfileSwitchModal";
import AlertModal, { type AlertModalOptions } from "./AlertModal";
import { alertStore } from "./alertStore";

export type ModalType =
  | "checklist-recommend"
  | "plan-change"
  | "checklist-defer"
  | "coupon-issued"
  | "subscription-cancel"
  | "subscription-restart"
  | "member-withdraw"
  | "profile-switch";

interface ModalContextValue {
  openModal: (type: ModalType, onConfirm?: () => void) => void;
  openAlert: (options: AlertModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ModalType | null>(null);
  const [activeConfirm, setActiveConfirm] = useState<(() => void) | null>(null);
  const [alertOptions, setAlertOptions] = useState<AlertModalOptions | null>(null);

  const closeModal = useCallback(() => {
    setActive(null);
    setActiveConfirm(null);
    setAlertOptions(null);
  }, []);

  const openModal = useCallback((type: ModalType, onConfirm?: () => void) => {
    setAlertOptions(null);
    setActive(type);
    setActiveConfirm(onConfirm ? () => onConfirm : null);
  }, []);

  const openAlert = useCallback((options: AlertModalOptions) => {
    setActive(null);
    setActiveConfirm(null);
    setAlertOptions(options);
  }, []);

  /* 외부 스토어 구독 — React 밖에서 openAlertModal() 호출 시 반영 */
  useEffect(() => {
    return alertStore.subscribe((options) => {
      if (options) openAlert(options);
      else closeModal();
    });
  }, [openAlert, closeModal]);

  const isOpen = !!active || !!alertOptions;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* ESC로 닫기 — 모든 커스텀/알림 모달 공통 */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  const handleConfirm = activeConfirm
    ? () => { activeConfirm(); closeModal(); }
    : undefined;

  return (
    <ModalContext.Provider value={{ openModal, openAlert, closeModal }}>
      {children}

      {/* 커스텀 모달 */}
      {active === "checklist-recommend" && <ChecklistRecommendModal onClose={closeModal} onConfirm={handleConfirm} />}
      {active === "plan-change"          && <PlanChangeModal onClose={closeModal} />}
      {active === "checklist-defer"      && <ChecklistDeferModal onClose={closeModal} />}
      {active === "coupon-issued"        && <CouponIssuedModal onClose={closeModal} />}
      {active === "subscription-cancel"  && <SubscriptionCancelModal onClose={closeModal} onConfirm={handleConfirm} />}
      {active === "subscription-restart" && <SubscriptionRestartModal onClose={closeModal} onConfirm={handleConfirm} />}
      {active === "member-withdraw"      && <MemberWithdrawModal onClose={closeModal} onConfirm={handleConfirm} />}
      {active === "profile-switch"       && <ProfileSwitchModal onClose={closeModal} />}

      {/* 범용 알림 모달 */}
      {alertOptions && <AlertModal {...alertOptions} onClose={closeModal} />}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within <ModalProvider>");
  return ctx;
}
