"use client";

import { useModal, type ModalType } from "@/shared/ui";

const MODAL_ITEMS: { type: ModalType; label: string; description: string; color: string }[] = [
  {
    type: "checklist-recommend",
    label: "Modal 01",
    description: "체크리스트로 맞춤 추천",
    color: "bg-[#CDDAED] text-[var(--color-text)]",
  },
  {
    type: "plan-change",
    label: "Modal 02",
    description: "플랜 변경 경고",
    color: "bg-[#F28530] text-white",
  },
  {
    type: "checklist-defer",
    label: "Modal 03",
    description: "체크리스트 나중에",
    color: "bg-[#CDDAED] text-[var(--color-text)]",
  },
  {
    type: "coupon-issued",
    label: "Modal 04",
    description: "할인쿠폰 발급",
    color: "bg-[#F8CE38] text-[var(--color-text)]",
  },
  {
    type: "subscription-cancel",
    label: "Modal 05",
    description: "구독 취소 확인",
    color: "bg-[#F07050] text-white",
  },
  {
    type: "subscription-restart",
    label: "Modal 06",
    description: "구독 재시작",
    color: "bg-[#A8D4F5] text-[var(--color-text)]",
  },
  {
    type: "member-withdraw",
    label: "Modal 07",
    description: "회원 탈퇴 확인",
    color: "bg-[#F07050] text-white",
  },
];

export default function ModalTestButtons() {
  const { openModal } = useModal();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {MODAL_ITEMS.map(({ type, label, description, color }) => (
        <button
          key={type}
          onClick={() => openModal(type)}
          className={`flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-opacity hover:opacity-80 ${color}`}
        >
          <span className="text-xs font-semibold opacity-70">{label}</span>
          <span className="text-sm font-medium leading-tight">{description}</span>
        </button>
      ))}
    </div>
  );
}
