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

export type ModalType =
  | "checklist-recommend"
  | "plan-change"
  | "checklist-defer"
  | "coupon-issued";

interface ModalContextValue {
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ModalType | null>(null);

  const openModal = useCallback((type: ModalType) => setActive(type), []);
  const closeModal = useCallback(() => setActive(null), []);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {active === "checklist-recommend" && <ChecklistRecommendModal onClose={closeModal} />}
      {active === "plan-change"          && <PlanChangeModal onClose={closeModal} />}
      {active === "checklist-defer"      && <ChecklistDeferModal onClose={closeModal} />}
      {active === "coupon-issued"        && <CouponIssuedModal onClose={closeModal} />}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within <ModalProvider>");
  return ctx;
}
