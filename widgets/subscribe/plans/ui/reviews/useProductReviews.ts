"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getReviews } from "@/features/review/api";
import type { ReviewResponse, ReviewSortOrder } from "@/features/review/api";
import type { ReviewLightboxState } from "./ReviewImageLightbox";

export const REVIEWS_PER_PAGE = 10;

/**
 * 구독 상품 상세의 리뷰 도메인 상태(패칭·정렬·페이지네이션·라이트박스)를 캡슐화한다.
 * planId가 바뀌어도 page/sort는 호출부가 명시적으로 제어한다(기존 동작 유지).
 */
export function useProductReviews(planId: number) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<ReviewSortOrder>("LATEST");
  const [lightbox, setLightbox] = useState<ReviewLightboxState | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const fetchReviews = useCallback(
    async (id: number, p: number, sortOrder: ReviewSortOrder) => {
      setLoading(true);
      try {
        const data = await getReviews(id, p, REVIEWS_PER_PAGE, sortOrder);
        setReviews(data.items);
        setTotal(data.total);
        setAverage(data.averageRating);
      } catch {
        setReviews([]);
        setTotal(0);
        setAverage(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchReviews(planId, page, sort);
  }, [planId, page, sort, fetchReviews]);

  const reviewImages = useMemo(() => reviews.flatMap((r) => r.imageUrls ?? []), [reviews]);

  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));

  // 정렬 변경 시 첫 페이지로 리셋(기존 동작).
  const changeSort = useCallback((value: ReviewSortOrder) => {
    setSort(value);
    setPage(1);
  }, []);

  const openLightbox = useCallback((urls: string[], index: number) => {
    setLightbox({ urls, index });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const navigateLightbox = useCallback((next: number) => {
    setLightbox((s) => (s ? { ...s, index: next } : null));
  }, []);

  return {
    reviews,
    total,
    average,
    page,
    setPage,
    loading,
    sort,
    changeSort,
    totalPages,
    reviewImages,
    lightbox,
    openLightbox,
    closeLightbox,
    navigateLightbox,
  };
}

export type UseProductReviewsReturn = ReturnType<typeof useProductReviews>;
