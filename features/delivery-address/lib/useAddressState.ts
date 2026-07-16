"use client";

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { createDeliveryAddress } from "../api/deliveryAddressApi";
import type { DeliveryAddress } from "../api/types";
import { EMPTY_ADDR_STATE, type NewAddrState } from "./addressFormState";
import { openAddressSearchPopup } from "./openAddressSearchPopup";
import { digitsOnly } from "@/shared/lib/format";

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

  const handleAddressSelected = useCallback((addr: DeliveryAddress) => {
    setAddresses((prev) => {
      const idx = prev.findIndex((a) => a.id === addr.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = addr;
        return next;
      }
      return [...prev, addr];
    });
    setSelectedAddressId(addr.id);
  }, []);

  function handleChangeAddress() {
    const url = selectedAddressId
      ? `/address?selectedId=${selectedAddressId}`
      : "/address";
    window.open(url, "addressPopup", "width=480,height=700,scrollbars=yes");
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
    createAddress,
  };
}
