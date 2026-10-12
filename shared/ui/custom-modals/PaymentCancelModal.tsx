"use client";

import IllustratedConfirmModal from "./IllustratedConfirmModal";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
  onConfirm2?: () => void;
}

export default function PaymentCancelModal({ onClose, onConfirm, onConfirm2 }: Props) {
  return (
    <IllustratedConfirmModal
      onClose={onClose}
      illustration="warning"
      accentColor="var(--color-modal-warning)"
      title={
        <>
          결제 취소 시 <span className="text-[var(--color-modal-warning)]">꼬순박스 구독</span>도
          <br />
          취소하시겠습니까?
        </>
      }
      description={
        <>
          결제를 취소하시면 이번 달 상품은 배송되지 않습니다.
          <br />
          취소를 누르시면 정기 구독도 함께 종료됩니다.
        </>
      }
      primaryLabel="이번 결제만 취소하기"
      onPrimary={onConfirm ?? onClose}
      secondaryLabel="결제 취소 및 구독 해지하기"
      onSecondary={onConfirm2 ?? onClose}
    />
  );
}
