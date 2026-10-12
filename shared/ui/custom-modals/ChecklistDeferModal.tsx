"use client";

import { openChecklistForm } from "@/shared/lib/checklistModal";
import IllustratedConfirmModal from "./IllustratedConfirmModal";

interface Props {
  onClose: () => void;
}

export default function ChecklistDeferModal({ onClose }: Props) {
  return (
    <IllustratedConfirmModal
      onClose={onClose}
      illustration="checklist"
      accentColor="var(--color-modal-checklist)"
      title={
        <>
          지금
          <br />
          <span className="text-[var(--color-modal-checklist)]">작성하지 않아도</span> 괜찮아요!
        </>
      }
      description={
        <>
          [마이페이지 &gt; 체크리스트 작성하기] 메뉴에서 언제든지
          <br />
          아이의 특성을 등록하고 맞춤 솔루션을 확인해보세요.
        </>
      }
      primaryLabel="확인"
      onPrimary={onClose}
      secondaryLabel="체크리스트 하러가기"
      onSecondary={() => { onClose(); openChecklistForm(); }}
    />
  );
}
