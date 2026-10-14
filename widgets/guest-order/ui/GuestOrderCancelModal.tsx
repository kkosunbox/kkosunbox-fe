"use client";

import { useState } from "react";
import type { CancelProductOrderItemRequest, ProductOrderItemDto } from "@/features/product/api";
import { ModalShell, QuantityMinusIcon, QuantityPlusIcon } from "@/shared/ui";

interface Props {
  items: ProductOrderItemDto[];
  busy: boolean;
  onClose: () => void;
  /** items가 undefined면 남은 전량 취소 */
  onConfirm: (items?: CancelProductOrderItemRequest[]) => void;
}

/** 비회원 주문 취소 — 상품별 취소 수량을 골라 취소한다. 남은 전량을 고르면 전체 취소로 요청한다 */
export function GuestOrderCancelModal({ items, busy, onClose, onConfirm }: Props) {
  const cancellable = items.filter((item) => item.remainingQuantity > 0);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const selected = cancellable
    .map((item) => ({ itemId: item.id, quantity: quantities[item.id] ?? 0 }))
    .filter((item) => item.quantity > 0);
  const allSelected = cancellable.every((item) => quantities[item.id] === item.remainingQuantity);

  function change(item: ProductOrderItemDto, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [item.id]: Math.min(item.remainingQuantity, Math.max(0, (prev[item.id] ?? 0) + delta)),
    }));
  }

  function selectAll() {
    setQuantities(Object.fromEntries(cancellable.map((item) => [item.id, item.remainingQuantity])));
  }

  return (
    <ModalShell label="주문 취소" onClose={onClose}>
      <div className="relative w-full max-w-[400px] rounded-[20px] bg-white p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-6 right-6 flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6L18 18" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="pr-8 text-subtitle-18-b text-[var(--color-text)]">주문을 취소할까요?</h2>
        <p className="mt-2 text-body-14-m text-[var(--color-text-secondary)]">
          취소할 상품과 수량을 선택해 주세요.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={selectAll}
            disabled={allSelected}
            className="text-body-13-m text-[var(--color-text-secondary)] underline underline-offset-2 transition-opacity hover:opacity-70 disabled:no-underline disabled:opacity-40"
          >
            전체 선택
          </button>
        </div>
        <ul className="mt-2 divide-y divide-[var(--color-border-light)] border-y border-[var(--color-border-light)]">
          {cancellable.map((item) => {
            const quantity = quantities[item.id] ?? 0;
            return (
              <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="break-words text-body-14-sb text-[var(--color-text)]">{item.productName}</p>
                  <p className="mt-1 text-body-13-r text-[var(--color-text-secondary)]">취소 가능 {item.remainingQuantity}개</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button type="button" aria-label={`${item.productName} 취소 수량 감소`} onClick={() => change(item, -1)} disabled={quantity <= 0} className="flex h-6 w-6 items-center justify-center disabled:opacity-30"><QuantityMinusIcon /></button>
                  <span className="min-w-[20px] text-center text-body-14-sb text-[var(--color-text)]">{quantity}</span>
                  <button type="button" aria-label={`${item.productName} 취소 수량 증가`} onClick={() => change(item, 1)} disabled={quantity >= item.remainingQuantity} className="flex h-6 w-6 items-center justify-center disabled:opacity-30"><QuantityPlusIcon /></button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-[8px] border border-[var(--color-cta-button)] bg-white text-body-14-sb text-[var(--color-cta-button)]"
          >
            돌아가기
          </button>
          <button
            type="button"
            disabled={busy || selected.length === 0}
            onClick={() => onConfirm(allSelected ? undefined : selected)}
            className="h-12 rounded-[8px] bg-[var(--color-cta-button)] text-body-14-sb text-white disabled:opacity-40"
          >
            주문취소
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
