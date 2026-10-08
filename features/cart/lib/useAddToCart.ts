"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import { getProducts, type ProductDto } from "@/features/product/api";
import { loadOrderPolicy, type OrderPolicyDto } from "@/shared/lib/orderPolicy";
import { getErrorMessage } from "@/shared/lib/api";
import { useModal } from "@/shared/ui";
import type { CartDto } from "../api";
import { getCartGateway } from "./cartGateway";
import { notifyCartUpdated } from "./events";
import { getCartRecommendationPool } from "./cartAdded";

export function useAddToCart() {
  const { openAlert } = useModal();
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [policy, setPolicy] = useState<OrderPolicyDto | null>(null);
  const [recommendations, setRecommendations] = useState<ProductDto[]>([]);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const catalog = useRef<ProductDto[]>([]);
  const recommendationsRef = useRef<ProductDto[]>([]);
  const recommendationPoolRef = useRef<ProductDto[]>([]);
  const busy = useRef(false);
  const session = useRef(0);

  useEffect(() => () => { session.current += 1; }, []);

  function close() {
    session.current += 1;
    catalog.current = [];
    recommendationsRef.current = [];
    recommendationPoolRef.current = [];
    setCart(null);
    setRecommendations([]);
    setError(null);
  }

  async function add(productId: number, quantity = 1) {
    if (busy.current) return false;
    busy.current = true;
    const currentSession = session.current;
    const fromModal = cart !== null;
    setPendingProductId(productId);
    setError(null);
    try {
      // 정책 조회 실패는 담기 결과에 영향을 주지 않는다 — 모달은 장바구니 응답 기준으로 표시된다.
      const [updated, orderPolicy] = await Promise.all([
        getCartGateway(isLoggedIn).add(productId, quantity),
        loadOrderPolicy().catch(() => null),
      ]);
      notifyCartUpdated();
      if (currentSession !== session.current) return false;
      setCart(updated);
      if (orderPolicy) setPolicy(orderPolicy);
      if (!fromModal) {
        setRecommendations([]);
        // 추천 조회 실패가 이미 성공한 장바구니 담기를 실패로 바꾸지 않도록 분리한다.
        void getProducts().then(({ products: list }) => {
          if (currentSession === session.current) {
            catalog.current = list;
            const initialPool = getCartRecommendationPool(
              list,
              Math.random,
              updated.items.map((item) => item.productId),
            );
            const nextRecommendations = initialPool.slice(0, 3);
            recommendationPoolRef.current = initialPool.slice(3);
            recommendationsRef.current = nextRecommendations;
            setRecommendations(nextRecommendations);
          }
        }).catch(() => {});
      }
      return true;
    } catch (cause) {
      if (currentSession !== session.current) return false;
      const message = getErrorMessage(cause, "내 패키지에 담지 못했습니다.");
      if (fromModal) setError(message);
      else openAlert({ title: message });
      return false;
    } finally {
      busy.current = false;
      setPendingProductId(null);
    }
  }

  function replaceRecommendation(productId: number) {
    const currentRecommendations = recommendationsRef.current;
    const index = currentRecommendations.findIndex((product) => product.id === productId);
    if (index < 0) return false;

    let pool = recommendationPoolRef.current;
    if (pool.length === 0) {
      pool = getCartRecommendationPool(
        catalog.current,
        Math.random,
        [productId, ...currentRecommendations.filter((product) => product.id !== productId).map((product) => product.id)],
      );
    }

    const [replacement, ...remainingPool] = pool;
    if (!replacement) {
      const nextRecommendations = currentRecommendations.filter((product) => product.id !== productId);
      recommendationsRef.current = nextRecommendations;
      recommendationPoolRef.current = [];
      setRecommendations(nextRecommendations);
      return "removed" as const;
    }

    const nextRecommendations = [...currentRecommendations];
    nextRecommendations[index] = replacement;
    recommendationPoolRef.current = remainingPool;
    recommendationsRef.current = nextRecommendations;
    setRecommendations(nextRecommendations);
    return "replaced" as const;
  }

  return { cart, policy, recommendations, pendingProductId, error, add, replaceRecommendation, close };
}
