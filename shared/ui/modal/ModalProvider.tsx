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

export type ModalType =
  | "checklist-recommend"
  | "plan-change"
  | "checklist-defer"
  | "coupon-issued"
  | "subscription-cancel"
  | "subscription-restart"
  | "member-withdraw";

interface ModalContextValue {
  openModal: (type: ModalType, onConfirm?: () => void) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ModalType | null>(null);
  const [activeConfirm, setActiveConfirm] = useState<(() => void) | null>(null);

  const closeModal = useCallback(() => {
    setActive(null);
    setActiveConfirm(null);
  }, []);

  const openModal = useCallback((type: ModalType, onConfirm?: () => void) => {
    setActive(type);
    // 함수를 state로 저장할 때 updater로 취급되지 않도록 래핑
    setActiveConfirm(onConfirm ? () => onConfirm : null);
  }, []);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  // onConfirm 실행 후 자동으로 모달 닫기
  const handleConfirm = activeConfirm
    ? () => { activeConfirm(); closeModal(); }
    : undefined;

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {active === "checklist-recommend" && <ChecklistRecommendModal onClose={closeModal} onConfirm={handleConfirm} />}
      {active === "plan-change"          && <PlanChangeModal onClose={closeModal} />}
      {active === "checklist-defer"      && <ChecklistDeferModal onClose={closeModal} />}
      {active === "coupon-issued"        && <CouponIssuedModal onClose={closeModal} />}
      {active === "subscription-cancel"  && <SubscriptionCancelModal onClose={closeModal} onConfirm={handleConfirm} />}
      {active === "subscription-restart" && <SubscriptionRestartModal onClose={closeModal} onConfirm={handleConfirm} />}
      {active === "member-withdraw"      && <MemberWithdrawModal onClose={closeModal} onConfirm={handleConfirm} />}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within <ModalProvider>");
  return ctx;
}
