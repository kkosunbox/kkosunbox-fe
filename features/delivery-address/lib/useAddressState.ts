"use client";

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { createDeliveryAddress } from "../api/deliveryAddressApi";
import type { DeliveryAddress } from "../api/types";
import { EMPTY_ADDR_STATE, type NewAddrState } from "./addressFormState";
import { openAddressSearchPopup } from "./openAddressSearchPopup";
import { digitsOnly } from "@/shared/lib/format";
import { openCenteredPopup } from "@/shared/lib/popup";

export interface AddressStateResult {
  selectedAddress: DeliveryAddress | null;
  selectedAddressId: number | null;
  newAddr: NewAddrState;
  setNewAddr: Dispatch<SetStateAction<NewAddrState>>;
  phoneError: string | null;
  setPhoneError: (err: string | null) => void;
  handleChangeAddress: () => void;
  handleSearchAddress: () => void;
  handleAddressSelected: (addr: DeliveryAddress) => void;
  handleAddressSaved: (addr: DeliveryAddress) => void;
  handleAddressDeleted: (id: number) => void;
  createAddress: () => Promise<number>;
}

export function useAddressState({
  initialAddresses,
}: {
  initialAddresses: DeliveryAddress[];
}): AddressStateResult {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    initialAddresses[0]?.id ?? null,
  );

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const [newAddr, setNewAddr] = useState<NewAddrState>(EMPTY_ADDR_STATE);

  const [phoneError, setPhoneError] = useState<string | null>(null);

  const upsertAddress = useCallback((addr: DeliveryAddress) => {
    setAddresses((prev) => {
      const idx = prev.findIndex((a) => a.id === addr.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = addr;
        return next;
      }
      return [...prev, addr];
    });
  }, []);

  const handleAddressSelected = useCallback((addr: DeliveryAddress) => {
    upsertAddress(addr);
    setSelectedAddressId(addr.id);
  }, [upsertAddress]);

  /** 팝업에서 수정·추가만 하고 닫아도 결제화면 표시가 최신 정보를 따르도록 목록만 갱신 (선택은 유지) */
  const handleAddressSaved = useCallback((addr: DeliveryAddress) => {
    upsertAddress(addr);
    // 배송지가 하나도 없던 상태에서 추가했다면 바로 선택해 입력 폼 대신 보여준다
    setSelectedAddressId((current) => current ?? addr.id);
  }, [upsertAddress]);

  /** 선택 중이던 배송지가 삭제되면 남은 첫 배송지로, 없으면 신규 입력 폼으로 전환 */
  const handleAddressDeleted = useCallback((id: number) => {
    const remaining = addresses.filter((a) => a.id !== id);
    setAddresses(remaining);
    setSelectedAddressId((current) => (current === id ? remaining[0]?.id ?? null : current));
  }, [addresses]);

  function handleChangeAddress() {
    const url = selectedAddressId
      ? `/address?mode=select&selectedId=${selectedAddressId}`
      : "/address?mode=select";
    openCenteredPopup(url, "addressPopup", { width: 480, height: 700 });
  }

  function handleSearchAddress() {
    openAddressSearchPopup(setNewAddr);
  }

  const createAddress = useCallback(async (): Promise<number> => {
    const created = await createDeliveryAddress({
      receiverName: newAddr.receiverName.trim(),
      phoneNumber: digitsOnly(newAddr.phoneNumber),
      zipCode: newAddr.zipCode.trim(),
      address: newAddr.address.trim(),
      addressDetail: newAddr.addressDetail.trim() || undefined,
      memo: newAddr.memo.trim() || undefined,
    });
    setAddresses((prev) => [...prev, created]);
    setSelectedAddressId(created.id);
    return created.id;
  }, [newAddr]);

  return {
    selectedAddress,
    selectedAddressId,
    newAddr,
    setNewAddr,
    phoneError,
    setPhoneError,
    handleChangeAddress,
    handleSearchAddress,
    handleAddressSelected,
    handleAddressSaved,
    handleAddressDeleted,
    createAddress,
  };
}
