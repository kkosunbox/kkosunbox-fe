"use client";

import { useCallback, useState } from "react";
import type { DeliveryAddress } from "../api/types";
import AddressListView from "./AddressListView";
import AddressFormView from "./AddressFormView";
import DaumPostcodeEmbed from "./DaumPostcodeEmbed";

type View = "list" | "form" | "search";

interface Props {
  initialAddresses: DeliveryAddress[];
}

export default function AddressManager({ initialAddresses }: Props) {
  const [view, setView] = useState<View>("list");
  const [addresses, setAddresses] =
    useState<DeliveryAddress[]>(initialAddresses);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialAddresses[0]?.id ?? null,
  );
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(
    null,
  );

  const [pendingZipCode, setPendingZipCode] = useState("");
  const [pendingAddress, setPendingAddress] = useState("");

  const closeWindow = useCallback(() => {
    window.close();
  }, []);

  function handleAddNew() {
    setEditingAddress(null);
    setPendingZipCode("");
    setPendingAddress("");
    setView("form");
  }

  function handleEdit(address: DeliveryAddress) {
    setEditingAddress(address);
    setPendingZipCode(address.zipCode);
    setPendingAddress(address.address);
    setView("form");
  }

  function handleSelect(id: number) {
    setSelectedId(id);
    const selected = addresses.find((a) => a.id === id);
    if (selected && window.opener) {
      window.opener.postMessage(
        { type: "ADDRESS_SELECTED", address: selected },
        window.location.origin,
      );
    }
  }

  function handleDeleted(id: number) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function handleSaved(saved: DeliveryAddress) {
    setAddresses((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setView("list");
  }

  function handleSearchAddress() {
    setView("search");
  }

  function handlePostcodeComplete(zipCode: string, address: string) {
    setPendingZipCode(zipCode);
    setPendingAddress(address);
    setView("form");
  }

  function handleBackToForm() {
    setView("form");
  }

  function handleFormClose() {
    setPendingZipCode("");
    setPendingAddress("");
    setEditingAddress(null);
    setView("list");
  }

  const showForm = view === "form" || view === "search";

  return (
    <>
      {/* List view */}
      {view === "list" && (
        <AddressListView
          addresses={addresses}
          selectedId={selectedId}
          onSelect={handleSelect}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
          onClose={closeWindow}
        />
      )}

      {/* Form — kept mounted during search so input state survives */}
      <div className={view === "search" ? "hidden" : undefined}>
        {showForm && (
          <AddressFormView
            editingAddress={editingAddress}
            onSaved={handleSaved}
            onClose={handleFormClose}
            onSearchAddress={handleSearchAddress}
            pendingZipCode={pendingZipCode}
            pendingAddress={pendingAddress}
          />
        )}
      </div>

      {/* Address search overlay */}
      {view === "search" && (
        <DaumPostcodeEmbed
          onComplete={handlePostcodeComplete}
          onClose={handleBackToForm}
        />
      )}
    </>
  );
}
