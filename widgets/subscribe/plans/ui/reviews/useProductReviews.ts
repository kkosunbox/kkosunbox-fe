"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductReviews, getReviews } from "@/features/review/api";
import type { ReviewResponse, ReviewSortOrder } from "@/features/review/api";
import type { ReviewLightboxState } from "./ReviewImageLightbox";
import { useReviewPhotos } from "./useReviewPhotos";

export const REVIEWS_PER_PAGE = 10;

/** 상단 사진 라이트박스에서 남은 로드 사진이 이 수 이하가 되면 다음 페이지를 미리 불러온다 */
const PHOTO_PREFETCH_THRESHOLD = 3;

/** 리뷰 카드 사진은 urls를 그대로 쓰고, 상단 사진 모음은 로드된 사진 목록을 따라가도록 출처를 구분한다 */
type LightboxSource = { kind: "urls"; urls: string[]; index: number } | { kind: "photos"; index: number };

/**
 * 구독 상품 상세의 리뷰 도메인 상태(패칭·정렬·페이지네이션·라이트박스)를 캡슐화한다.
 * initialPlanId가 null이면 전체 리뷰로 시작하고, 플랜 필터 변경 시 첫 페이지로 돌아간다.
 */
export function useProductReviews(initialPlanId: number | null = null, productId: number | null = null) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [tabTotal, setTabTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<ReviewSortOrder>("LATEST");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(initialPlanId);
  const [lightboxSource, setLightboxSource] = useState<LightboxSource | null>(null);
  const photos = useReviewPhotos(productId !== null ? null : selectedPlanId, productId);

  /* 라이트박스가 열린 동안의 body 스크롤 잠금은 globals.css의 `body:has(dialog:modal)`가 담당한다 */

  const fetchReviews = useCallback(
    async (id: number | null, p: number, sortOrder: ReviewSortOrder) => {
      setLoading(true);
      try {
        const data = productId !== null
          ? await getProductReviews(productId, p, REVIEWS_PER_PAGE, sortOrder)
          : await getReviews(id, p, REVIEWS_PER_PAGE, sortOrder);
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
    [initialPlanId, productId],
  );

  useEffect(() => {
    fetchReviews(selectedPlanId, page, sort);
  }, [selectedPlanId, page, sort, fetchReviews]);

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
    setLightboxSource({ kind: "urls", urls, index });
  }, []);

  const closeLightbox = useCallback(() => setLightboxSource(null), []);

  const { images: photoImages, total: photoTotal, hasMore: hasMorePhotos, loadMore: loadMorePhotos } = photos;

  /** 상단 사진 라이트박스가 로드된 사진 끝에 가까워지면 다음 페이지를 미리 불러온다 */
  const prefetchPhotosNear = useCallback(
    (index: number) => {
      if (hasMorePhotos && index >= photoImages.length - 1 - PHOTO_PREFETCH_THRESHOLD) loadMorePhotos();
    },
    [hasMorePhotos, photoImages.length, loadMorePhotos],
  );

  const openPhotoLightbox = useCallback(
    (index: number) => {
      setLightboxSource({ kind: "photos", index });
      prefetchPhotosNear(index);
    },
    [prefetchPhotosNear],
  );

  const navigateLightbox = useCallback(
    (next: number) => {
      setLightboxSource((s) => (s ? { ...s, index: next } : null));
      if (lightboxSource?.kind === "photos") prefetchPhotosNear(next);
    },
    [lightboxSource?.kind, prefetchPhotosNear],
  );

  const lightbox = useMemo<ReviewLightboxState | null>(() => {
    if (!lightboxSource) return null;
    if (lightboxSource.kind === "urls") return { urls: lightboxSource.urls, index: lightboxSource.index };
    return { urls: photoImages, index: lightboxSource.index, total: photoTotal };
  }, [lightboxSource, photoImages, photoTotal]);

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
    reviewImages: photoImages,
    reviewImageTotal: photoTotal,
    lightbox,
    openLightbox,
    openPhotoLightbox,
    closeLightbox,
    navigateLightbox,
  };
}

export type UseProductReviewsReturn = ReturnType<typeof useProductReviews>;
