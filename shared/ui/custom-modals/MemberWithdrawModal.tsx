"use client";

import IllustratedConfirmModal from "./IllustratedConfirmModal";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

export default function MemberWithdrawModal({ onClose, onConfirm }: Props) {
  return (
    <IllustratedConfirmModal
      onClose={onClose}
      illustration="withdraw"
      accentColor="var(--color-modal-danger)"
      title={
        <>
          정말로
          <br />
          <span className="text-[var(--color-modal-danger)]">계정 탈퇴</span>를 하시겠습니까?
        </>
      }
      description={
        <>
          지금 탈퇴하시면 그동안 쌓인 혜택과
          <br />
          맞춤 건강 데이터가 모두 삭제됩니다.
        </>
      }
      primaryLabel="다음에 할게요"
      onPrimary={onClose}
      secondaryLabel="회원 탈퇴하기"
      onSecondary={onConfirm ?? onClose}
    />
  );
}
