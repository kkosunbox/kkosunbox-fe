"use client";

import { useState } from "react";
import { CheckCircleIcon, useModal } from "@/shared/ui";
import { deleteConfirmAlertOptions } from "@/shared/lib/modal/alertPresets";
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

  function handleDelete(id: number) {
    openAlert(
      deleteConfirmAlertOptions("이 배송지를 삭제하시겠습니까?", () => {
        void performDelete(id);
      }),
    );
  }

  async function performDelete(id: number) {
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
    <div className="flex min-h-screen flex-col px-7 pb-7 pt-7">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <h2 className="text-subtitle-18-b leading-[21px] tracking-tightest text-[var(--color-text-emphasis)]">
          배송지 목록
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-5 w-5 items-center justify-center text-[var(--color-text)] transition-opacity hover:opacity-70"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
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
        className="mb-4 flex h-10 w-full items-center justify-center gap-1 rounded-[4px] border border-[var(--color-text-muted)] bg-white text-body-13-m text-[var(--color-text)] transition-opacity hover:opacity-80"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 6V18M6 12H18"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        배송지 신규 입력
      </button>

      {/* Address list */}
      <div className="flex flex-col gap-[22px]">
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
              className="relative h-[148px] rounded-lg border border-[var(--color-text-muted)] bg-white px-[19px] py-[19px]"
            >
              <div>
                <div className="min-w-0">
                  {/* Name + selected badge */}
                  <div className="flex items-center gap-1 pr-12">
                    {addr.nickname ? (
                      <span className="truncate text-body-13-m leading-4 tracking-[-0.04em] text-[var(--color-text)]">
                        {addr.nickname}
                      </span>
                    ) : null}
                    <span className="truncate text-body-13-m leading-4 tracking-[-0.04em] text-[var(--color-text)]">
                      {addr.receiverName}
                    </span>
                    {isSelected && (
                      <CheckCircleIcon color="var(--color-cta-button)" />
                    )}
                  </div>

                  {/* Phone */}
                  <p className="mt-[5px] text-caption-12-m-tight tracking-[-0.04em] text-[var(--color-text-secondary)]">
                    {addr.phoneNumber}
                  </p>

                  {/* Address */}
                  <p className="mt-[5px] text-caption-12-m-tight tracking-[-0.04em] text-[var(--color-text-secondary)]">
                    {addr.address}
                    {addr.addressDetail ? ` ${addr.addressDetail}` : ""}
                    {addr.zipCode ? ` (${addr.zipCode})` : ""}
                  </p>
                </div>

                {/* Select button */}
                {isSelected ? (
                  <span className="absolute right-[19px] top-[27px] text-body-13-m leading-4 text-[var(--color-cta-button)]">
                    선택됨
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelect(addr.id)}
                    className="absolute right-[19px] top-[19px] flex h-8 w-[39px] items-center justify-center rounded-[4px] bg-[var(--color-cta-button)] text-body-13-m leading-4 text-white transition-opacity hover:opacity-90"
                  >
                    선택
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="absolute bottom-[19px] left-[19px] flex gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(addr)}
                  className="flex h-8 w-10 items-center justify-center rounded-[4px] border border-[var(--color-text-muted)] bg-white text-body-13-m leading-4 text-[var(--color-text)] transition-opacity hover:opacity-80"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="flex h-8 min-w-10 items-center justify-center rounded-[4px] border border-[var(--color-text-muted)] bg-white px-2 text-body-13-m leading-4 text-[var(--color-text)] transition-opacity hover:opacity-80 disabled:opacity-50"
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
