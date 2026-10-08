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

/** 비회원 주문 취소 — 상품별 취소 수량을 골라 부분 취소하거나 남은 전체를 취소한다 */
export function GuestOrderCancelModal({ items, busy, onClose, onConfirm }: Props) {
  const cancellable = items.filter((item) => item.remainingQuantity > 0);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const selected = cancellable
    .map((item) => ({ itemId: item.id, quantity: quantities[item.id] ?? 0 }))
    .filter((item) => item.quantity > 0);

  function change(item: ProductOrderItemDto, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [item.id]: Math.min(item.remainingQuantity, Math.max(0, (prev[item.id] ?? 0) + delta)),
    }));
  }

  return (
    <ModalShell label="주문 취소" onClose={onClose}>
      <div className="relative w-full max-w-[400px] rounded-[20px] bg-white p-6">
        <h2 className="text-subtitle-18-b text-[var(--color-text)]">주문을 취소할까요?</h2>
        <p className="mt-2 text-body-14-m text-[var(--color-text-secondary)]">
          취소할 상품과 수량을 선택하거나, 남은 상품 전체를 취소할 수 있습니다.
        </p>

        <ul className="mt-5 divide-y divide-[var(--color-border-light)] border-y border-[var(--color-border-light)]">
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
            disabled={busy}
            onClick={() => onConfirm()}
            className="h-12 rounded-[8px] border border-[var(--color-cta-button)] bg-white text-body-14-sb text-[var(--color-cta-button)] disabled:opacity-50"
          >
            전체 취소
          </button>
          <button
            type="button"
            disabled={busy || selected.length === 0}
            onClick={() => onConfirm(selected)}
            className="h-12 rounded-[8px] bg-[var(--color-cta-button)] text-body-14-sb text-white disabled:opacity-40"
          >
            선택 상품 취소
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-3 h-10 w-full text-body-14-m text-[var(--color-text-secondary)]">돌아가기</button>
      </div>
    </ModalShell>
  );
}
