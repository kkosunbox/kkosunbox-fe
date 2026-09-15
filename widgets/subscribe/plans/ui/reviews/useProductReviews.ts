"use client";

import { useCallback, useEffect, useState } from "react";
import { getReviews } from "@/features/review/api";
import type { ReviewResponse, ReviewSortOrder } from "@/features/review/api";
import type { ReviewLightboxState } from "./ReviewImageLightbox";

export const REVIEWS_PER_PAGE = 10;

/**
 * 구독 상품 상세의 리뷰 도메인 상태(패칭·정렬·페이지네이션·라이트박스)를 캡슐화한다.
 * initialPlanId가 null이면 전체 리뷰로 시작하고, 플랜 필터 변경 시 첫 페이지로 돌아간다.
 */
export function useProductReviews(initialPlanId: number | null = null) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [tabTotal, setTabTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<ReviewSortOrder>("LATEST");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(initialPlanId);
  const [lightbox, setLightbox] = useState<ReviewLightboxState | null>(null);
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const fetchReviews = useCallback(
    async (id: number | null, p: number, sortOrder: ReviewSortOrder) => {
      setLoading(true);
      try {
        const data = await getReviews(id, p, REVIEWS_PER_PAGE, sortOrder);
        setReviews(data.items);
        setTotal(data.total);
        if (id === initialPlanId) setTabTotal(data.total);
        setAverage(data.averageRating);
      } catch {
        setReviews([]);
        setTotal(0);
        if (id === initialPlanId) setTabTotal(0);
        setAverage(0);
      } finally {
        setLoading(false);
      }
    },
    [initialPlanId],
  );

  useEffect(() => {
    fetchReviews(selectedPlanId, page, sort);
  }, [selectedPlanId, page, sort, fetchReviews]);

  // 상단 사진 모음은 목록 정렬/페이지와 무관하게 항상 가장 최신 리뷰 사진을 보여준다.
  useEffect(() => {
    let cancelled = false;

    getReviews(selectedPlanId, 1, REVIEWS_PER_PAGE, "LATEST")
      .then((data) => {
        if (!cancelled) {
          setReviewImages(data.items.flatMap((review) => review.imageUrls ?? []));
        }
      })
      .catch(() => {
        if (!cancelled) setReviewImages([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPlanId]);

  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));

  // 정렬 변경 시 첫 페이지로 리셋(기존 동작).
  const changeSort = useCallback((value: ReviewSortOrder) => {
    setSort(value);
    setPage(1);
  }, []);

  const changePlan = useCallback((value: number | null) => {
    setSelectedPlanId(value);
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
    tabTotal,
    average,
    page,
    setPage,
    loading,
    sort,
    changeSort,
    selectedPlanId,
    changePlan,
    totalPages,
    reviewImages,
    lightbox,
    openLightbox,
    closeLightbox,
    navigateLightbox,
  };
}

export type UseProductReviewsReturn = ReturnType<typeof useProductReviews>;
