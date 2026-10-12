"use client";

import IllustratedConfirmModal from "./IllustratedConfirmModal";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
  onConfirm2?: () => void;
}

export default function SubscriptionCancelWithDeliveryModal({ onClose, onConfirm, onConfirm2 }: Props) {
  return (
    <IllustratedConfirmModal
      onClose={onClose}
      illustration="warning"
      accentColor="var(--color-modal-warning)"
      title={
        <>
          잠깐만요!
          <br />
          <span className="text-[var(--color-modal-warning)]">받지못한 상품</span>이 있어요.
        </>
      }
      description={
        <>
          이미 결제된 상품은 예정대로 배송해 드릴까요?
          <br />
          지금 배송까지 취소하시면 즉시 환불 처리가 진행됩니다.
        </>
      }
      primaryLabel="이번 건만 받고 해지하기"
      onPrimary={onConfirm ?? onClose}
      secondaryLabel="전체 취소하기"
      onSecondary={onConfirm2 ?? onClose}
    />
  );
}
