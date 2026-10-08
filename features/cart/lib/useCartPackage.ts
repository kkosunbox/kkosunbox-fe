"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import { getErrorMessage } from "@/shared/lib/api";
import { useOrderPolicy } from "@/shared/lib/orderPolicy";
import { useModal } from "@/shared/ui";
import type { CartDto } from "../api/types";
import { getCartGateway } from "./cartGateway";
import { CART_UPDATED_EVENT, notifyCartUpdated } from "./events";
import { isGuestCartStorageEvent, MAX_CART_ITEM_QUANTITY } from "./guestCart";
import { getPackageProgress } from "./packageProgress";

/**
 * 내 패키지 — 장바구니(회원: 서버 / 비회원: 브라우저)를 패키지 형태로 보여주고 조작한다.
 * 다른 화면(상세 담기, 장바구니 페이지, 다른 탭)의 변경도 장바구니 갱신 이벤트로 따라간다.
 */
export function useCartPackage() {
  const { isLoggedIn } = useAuth();
  const { openAlert } = useModal();
  const gateway = useMemo(() => getCartGateway(isLoggedIn), [isLoggedIn]);
  const [cart, setCart] = useState<CartDto | null>(null);
  const policy = useOrderPolicy();
  const [loaded, setLoaded] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [pendingItemIds, setPendingItemIds] = useState<ReadonlySet<number>>(new Set());
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++requestId.current;
    try {
      const data = await gateway.getCart();
      if (current === requestId.current) setCart(data);
    } catch {
      // 조회 실패는 마지막으로 받은 패키지를 유지한다.
    } finally {
      if (current === requestId.current) setLoaded(true);
    }
  }, [gateway]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => { if (!isLoggedIn && isGuestCartStorageEvent(event)) void refresh(); };
    const handleUpdated = () => { void refresh(); };
    void refresh();
    window.addEventListener(CART_UPDATED_EVENT, handleUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      requestId.current += 1;
      window.removeEventListener(CART_UPDATED_EVENT, handleUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, [isLoggedIn, refresh]);

  function setItemPending(id: number, pending: boolean) {
    setPendingItemIds((current) => {
      const next = new Set(current);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /** @returns 담기에 성공했는지 */
  async function add(productId: number, quantity = 1) {
    if (pendingProductId !== null) return false;
    setPendingProductId(productId);
    try {
      const updated = await gateway.add(productId, quantity);
      requestId.current += 1;
      setCart(updated);
      notifyCartUpdated();
      return true;
    } catch (err) {
      openAlert({ title: getErrorMessage(err, "내 패키지에 담지 못했습니다.") });
      return false;
    } finally {
      setPendingProductId(null);
    }
  }

  async function changeQuantity(id: number, quantity: number) {
    if (quantity < 1 || quantity > MAX_CART_ITEM_QUANTITY || pendingItemIds.has(id)) return;
    setItemPending(id, true);
    try {
      const updated = await gateway.update(id, quantity);
      requestId.current += 1;
      setCart(updated);
      notifyCartUpdated();
    } catch (err) {
      openAlert({ title: getErrorMessage(err, "수량을 변경하지 못했습니다.") });
    } finally {
      setItemPending(id, false);
    }
  }

  async function remove(id: number) {
    if (pendingItemIds.has(id)) return;
    setItemPending(id, true);
    try {
      await gateway.remove(id);
      notifyCartUpdated();
      await refresh();
    } catch (err) {
      openAlert({ title: getErrorMessage(err, "상품을 삭제하지 못했습니다.") });
    } finally {
      setItemPending(id, false);
    }
  }

  return {
    cart,
    loaded,
    progress: getPackageProgress(cart, policy),
    pendingProductId,
    pendingItemIds,
    add,
    changeQuantity,
    remove,
  };
}

export type CartPackage = ReturnType<typeof useCartPackage>;
