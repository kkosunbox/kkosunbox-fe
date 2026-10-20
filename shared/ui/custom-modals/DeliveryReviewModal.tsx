"use client";

import IllustratedConfirmModal from "./IllustratedConfirmModal";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

/** 배송완료 리뷰 유도 팝업 (Figma 5936:34153) */
export default function DeliveryReviewModal({ onClose, onConfirm }: Props) {
  return (
    <IllustratedConfirmModal
      onClose={onClose}
      illustration="review"
      accentColor="var(--color-modal-warning)"
      title={
        <>
          리뷰로
          <br />
          <span className="text-[var(--color-modal-warning)]">소중한 의견</span>을 들려주세요.
        </>
      }
      description={
        <>
          받아보신 상품은 만족스러우셨나요?
          <br />
          리뷰를 남겨주시면 더 나은 서비스로 보답하겠습니다.
        </>
      }
      primaryLabel="리뷰쓰기"
      onPrimary={onConfirm ?? onClose}
      secondaryLabel="다음에 하기"
      onSecondary={onClose}
    />
  );
}
