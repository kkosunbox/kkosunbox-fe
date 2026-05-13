"use client";

import { useModal, type ModalType, type AlertModalType } from "@/shared/ui";

function fireTestConfetti() {
  import("canvas-confetti").then(({ default: confetti }) => {
    const shared = {
      particleCount: 45,
      spread: 55,
      startVelocity: 42,
      ticks: 180,
      gravity: 1.3,
      scalar: 0.85,
    } as const;
    confetti({ ...shared, origin: { x: 0.1, y: 0.9 }, angle: 65 });
    confetti({ ...shared, origin: { x: 0.9, y: 0.9 }, angle: 115 });
  });
}

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
  {
    type: "subscription-change-confirm",
    label: "Modal 11",
    description: "구독 변경 확인",
    color: "bg-[#FCA14E] text-white",
  },
  {
    type: "delivery-review",
    label: "Modal 12",
    description: "배송완료 후 리뷰쓰기",
    color: "bg-[#DAE9FF] text-[var(--color-text)]",
  },
];

type DualActionItem = {
  type: ModalType;
  label: string;
  description: string;
  color: string;
  primaryLabel: string;
  secondaryLabel: string;
};

const DUAL_ACTION_ITEMS: DualActionItem[] = [
  {
    type: "subscription-cancel-with-delivery",
    label: "Modal 08",
    description: "구독 취소 (배송 건 있음)",
    color: "bg-[#FCA14E] text-white",
    primaryLabel: "이번 건만 받고 해지하기",
    secondaryLabel: "전체 취소하기",
  },
  {
    type: "payment-cancel",
    label: "Modal 09",
    description: "결제 취소 확인",
    color: "bg-[#FCA14E] text-white",
    primaryLabel: "이번 결제만 취소하기",
    secondaryLabel: "결제 취소 및 구독 해지",
  },
];

const PAUSE_ITEM = {
  type: "subscription-pause" as ModalType,
  label: "Modal 10",
  description: "구독 쉬어가기",
  color: "bg-[#ABBEF3] text-[var(--color-text)]",
  primaryLabel: "이번 달만 쉬어가기",
};

const ALERT_TYPE_ITEMS: { type: AlertModalType; label: string; description: string; color: string }[] = [
  { type: "alert",    label: "Alert",    description: "경고 / 오류",  color: "bg-orange-100 text-orange-900" },
  { type: "contents", label: "Contents", description: "내용 안내",    color: "bg-amber-100 text-amber-900" },
  { type: "info",     label: "Info",     description: "정보 / 안내",  color: "bg-sky-100 text-sky-900" },
  { type: "present",  label: "Present",  description: "선물 / 혜택",  color: "bg-pink-100 text-pink-900" },
  { type: "success",  label: "Success",  description: "완료 / 성공",  color: "bg-green-100 text-green-900" },
];

export default function ModalTestButtons() {
  const { openModal, openAlert } = useModal();

  return (
    <div className="flex flex-col gap-6">
      {/* Alert 모달 5가지 타입 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-zinc-400">Alert 모달 · 5가지 타입</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {ALERT_TYPE_ITEMS.map(({ type, label, description, color }) => (
            <button
              key={type}
              onClick={() =>
                openAlert({
                  type,
                  title: `${label} 모달 예시`,
                  description:
                    type === "present"
                      ? "주문/결제 페이지의 '쿠폰 선택' 영역을 선택하면 [20% 할인 쿠폰]이 적용됩니다."
                      : type === "contents"
                      ? "페이지를 나가면 입력하신 정보가\n저장되지 않고 사라집니다.\n정말 이동하시겠습니까?"
                      : undefined,
                  secondaryLabel: type === "contents" ? "나가기" : undefined,
                  primaryLabel: type === "contents" ? "계속 작성하기" : "확인",
                })
              }
              className={`flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-opacity hover:opacity-80 ${color}`}
            >
              <span className="text-xs font-semibold opacity-70">{label}</span>
              <span className="text-sm font-medium leading-tight">{description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 01–07: 단일 액션 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-zinc-400">01 – 07 · 단일 액션</p>
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
      </div>

      {/* 08–09: 이중 액션 (onConfirm / onConfirm2 구분) */}
      <div>
        <p className="mb-2 text-xs font-semibold text-zinc-400">08 – 09 · 이중 액션 (콘솔 로그로 확인)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DUAL_ACTION_ITEMS.map(({ type, label, description, color, primaryLabel, secondaryLabel }) => (
            <button
              key={type}
              onClick={() =>
                openModal(
                  type,
                  () => console.log(`[${label}] 1차 확인: ${primaryLabel}`),
                  () => console.log(`[${label}] 2차 확인: ${secondaryLabel}`),
                )
              }
              className={`flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-opacity hover:opacity-80 ${color}`}
            >
              <span className="text-xs font-semibold opacity-70">{label}</span>
              <span className="text-sm font-medium leading-tight">{description}</span>
              <span className="text-xs opacity-60">① {primaryLabel}</span>
              <span className="text-xs opacity-60">② {secondaryLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 10: 단일 확인 + 취소 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-zinc-400">10 · 쉬어가기 확인</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() =>
              openModal(
                PAUSE_ITEM.type,
                () => console.log(`[Modal 10] 확인: ${PAUSE_ITEM.primaryLabel}`),
              )
            }
            className={`flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-opacity hover:opacity-80 ${PAUSE_ITEM.color}`}
          >
            <span className="text-xs font-semibold opacity-70">{PAUSE_ITEM.label}</span>
            <span className="text-sm font-medium leading-tight">{PAUSE_ITEM.description}</span>
            <span className="text-xs opacity-60">① {PAUSE_ITEM.primaryLabel}</span>
          </button>
        </div>
      </div>

      {/* 구매 성공 팡파레 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-zinc-400">기타 · 이펙트</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={fireTestConfetti}
            className="flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-opacity hover:opacity-80 bg-[#C8E6C9] text-[var(--color-text)]"
          >
            <span className="text-xs font-semibold opacity-70">Confetti</span>
            <span className="text-sm font-medium leading-tight">구매 성공 팡파레</span>
          </button>
        </div>
      </div>
    </div>
  );
}
