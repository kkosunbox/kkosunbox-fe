"use client";

import { useState } from "react";
import { useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import type { DeliveryAddress } from "../api/types";
import { deleteDeliveryAddress } from "../api/deliveryAddressApi";

interface Props {
  addresses: DeliveryAddress[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddNew: () => void;
  onEdit: (address: DeliveryAddress) => void;
  onDeleted: (id: number) => void;
  onClose: () => void;
}

export default function AddressListView({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  onEdit,
  onDeleted,
  onClose,
}: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { openAlert } = useModal();

  async function handleDelete(id: number) {
    if (!confirm("이 배송지를 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await deleteDeliveryAddress(id);
      onDeleted(id);
    } catch (err) {
      openAlert({
        title: getErrorMessage(err, "삭제에 실패했습니다. 다시 시도해주세요."),
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-subtitle-18-sb tracking-tightest text-[var(--color-text)]">
          배송지 목록
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center text-[var(--color-text)] transition-opacity hover:opacity-70"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Add new button */}
      <button
        type="button"
        onClick={onAddNew}
        className="mb-6 flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--color-text-muted)] bg-white text-body-14-m text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-light)]"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1v12M1 7h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        배송지 신규 입력
      </button>

      {/* Address list */}
      <div className="flex flex-col gap-4">
        {addresses.length === 0 && (
          <p className="py-10 text-center text-body-14-m text-[var(--color-text-secondary)]">
            등록된 배송지가 없습니다.
          </p>
        )}

        {addresses.map((addr) => {
          const isSelected = addr.id === selectedId;
          return (
            <div
              key={addr.id}
              className="rounded-lg border border-[var(--color-text-muted)] bg-white px-5 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Name + selected badge */}
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-body-14-sb text-[var(--color-text)]">
                      {addr.receiverName}
                    </span>
                    {isSelected && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="shrink-0"
                      >
                        <circle cx="8" cy="8" r="8" fill="var(--color-accent)" />
                        <path
                          d="M5 8l2 2 4-4"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Phone */}
                  <p className="text-body-13-r text-[var(--color-text-secondary)]">
                    {addr.phoneNumber}
                  </p>

                  {/* Address */}
                  <p className="mt-1 text-body-13-r leading-[1.5] text-[var(--color-text)]">
                    {addr.address}
                    {addr.addressDetail ? ` ${addr.addressDetail}` : ""}
                    {addr.zipCode ? ` (${addr.zipCode})` : ""}
                  </p>
                </div>

                {/* Select button */}
                {isSelected ? (
                  <span className="shrink-0 text-body-13-m text-[var(--color-accent)]">
                    선택됨
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelect(addr.id)}
                    className="shrink-0 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-body-13-sb text-white transition-opacity hover:opacity-90"
                  >
                    선택
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(addr)}
                  className="rounded-md border border-[var(--color-accent)] px-3 py-1 text-body-13-m text-[var(--color-accent)] transition-opacity hover:opacity-80"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="rounded-md border border-[var(--color-accent)] px-3 py-1 text-body-13-m text-[var(--color-accent)] transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {deletingId === addr.id ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
