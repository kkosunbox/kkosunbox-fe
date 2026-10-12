"use client";

import IllustratedConfirmModal from "./IllustratedConfirmModal";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

export default function SubscriptionRestartModal({ onClose, onConfirm }: Props) {
  return (
    <IllustratedConfirmModal
      onClose={onClose}
      illustration="restart"
      accentColor="var(--color-modal-restart)"
      title={
        <>
          새롭게
          <br />
          <span className="text-[var(--color-modal-restart)]">구독 재시작</span>을 하시겠습니까?
        </>
      }
      description={
        <>
          구독을 재시작하시는 날짜를 기준으로
          <br />
          구독 주기가 새롭게 시작됩니다.
        </>
      }
      primaryLabel="구독 재시작 하기"
      onPrimary={onConfirm ?? onClose}
      secondaryLabel="다음에 하기"
      onSecondary={onClose}
    />
  );
}
