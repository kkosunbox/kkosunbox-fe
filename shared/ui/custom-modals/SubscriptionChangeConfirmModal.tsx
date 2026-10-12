"use client";

import IllustratedConfirmModal from "./IllustratedConfirmModal";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

export default function SubscriptionChangeConfirmModal({ onClose, onConfirm }: Props) {
  return (
    <IllustratedConfirmModal
      onClose={onClose}
      illustration="warning"
      accentColor="var(--color-modal-warning)"
      title={
        <>
          다른 플랜으로
          <br />
          <span className="text-[var(--color-modal-warning)]">구독 변경</span>을 하시겠습니까?
        </>
      }
      description={
        <>
          아래의 &lsquo;다른 플랜 선택하기&rsquo;를 통해
          <br />
          원하시는 구성을 찾아보세요.
        </>
      }
      primaryLabel="다른 플랜 선택하기"
      onPrimary={onConfirm ?? onClose}
      secondaryLabel="다음에 하기"
      onSecondary={onClose}
    />
  );
}
