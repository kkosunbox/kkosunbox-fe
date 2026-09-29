"use client";

import { useState } from "react";
import { FORM_ACTION_CHIP_CLASS, FORM_INPUT_CLASS, SectionCard } from "@/shared/ui";

/** 단품 견적·주문 API의 초대코드 지원 전까지 할인 적용을 제공하지 않는다. */
export function PurchaseInviteCodeCard() {
  const [open, setOpen] = useState(true);

  return (
    <SectionCard variant="order" title="초대코드 입력" open={open} onToggle={() => setOpen((value) => !value)}>
      <div className="flex items-center">
        <span className="shrink-0 text-body-13-m text-[var(--color-text)] max-md:w-[82px] md:w-[60px]">코드입력</span>
        <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-[328px]">
          <input
            disabled
            aria-label="초대코드"
            aria-describedby="purchase-invite-notice"
            placeholder="초대코드를 입력해주세요."
            className={`${FORM_INPUT_CLASS} min-w-0 flex-1 disabled:cursor-not-allowed disabled:opacity-60`}
          />
          <button type="button" disabled className={`${FORM_ACTION_CHIP_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}>코드적용</button>
        </div>
      </div>
      <p id="purchase-invite-notice" className="mt-2 text-body-13-m text-[var(--color-text-secondary)] max-md:pl-[82px] md:pl-[60px]">
        단품 구매 초대코드 혜택은 준비 중입니다.
      </p>
    </SectionCard>
  );
}
