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
];

export default function ModalTestButtons() {
  const { openModal } = useModal();

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Custom Modal Test</h2>
        <p className="text-sm text-zinc-500">버튼을 눌러 각 커스텀 모달을 미리봅니다.</p>
      </div>
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
    </section>
  );
}
