"use client";

import { useEffect, useRef, useState } from "react";
import { getProducts, type ProductDto } from "@/features/product/api";
import { getErrorMessage } from "@/shared/lib/api";
import { useModal } from "@/shared/ui";
import { addCartItem, type CartDto } from "../api";
import { notifyCartUpdated } from "./events";
import { getCartRecommendations } from "./cartAdded";

export function useAddToCart() {
  const { openAlert } = useModal();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const session = useRef(0);

  useEffect(() => () => { session.current += 1; }, []);

  function close() {
    session.current += 1;
    setCart(null);
    setError(null);
  }

  async function add(productId: number, quantity = 1) {
    if (busy.current) return;
    busy.current = true;
    const currentSession = session.current;
    const fromModal = cart !== null;
    setPendingProductId(productId);
    setError(null);
    try {
      const updated = await addCartItem({ productId, quantity });
      notifyCartUpdated();
      if (currentSession !== session.current) return;
      setCart(updated);
      if (!fromModal) {
        setProducts([]);
        // 추천 조회 실패가 이미 성공한 장바구니 담기를 실패로 바꾸지 않도록 분리한다.
        void getProducts().then(({ products: list }) => {
          if (currentSession === session.current) setProducts(list);
        }).catch(() => {});
      }
    } catch (cause) {
      if (currentSession !== session.current) return;
      const message = getErrorMessage(cause, "장바구니에 담지 못했습니다.");
      if (fromModal) setError(message);
      else openAlert({ title: message });
    } finally {
      busy.current = false;
      setPendingProductId(null);
    }
  }

  return { cart, recommendations: cart ? getCartRecommendations(products, cart) : [], pendingProductId, error, add, close };
}
