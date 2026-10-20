"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getReviewPhotos } from "@/features/review/api";

export const REVIEW_PHOTOS_PER_PAGE = 20;

/**
 * 리뷰 탭 상단 사진 모음 상태. 리뷰 목록의 정렬/페이지와 무관하게 전체 리뷰 사진을 최신순으로 불러오고,
 * loadMore로 다음 페이지를 이어 붙인다. 대상(planId/productId)이 바뀌면 처음부터 다시 불러온다.
 */
export function useReviewPhotos(planId: number | null, productId: number | null) {
  const [images, setImages] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  // 대상이 바뀐 뒤 도착한 이전 응답을 버리기 위한 세대 번호
  const generationRef = useRef(0);
  const loadingRef = useRef(false);

  const fetchPage = useCallback(
    async (nextPage: number) => {
      const generation = generationRef.current;
      loadingRef.current = true;
      try {
        const data = await getReviewPhotos({
          planId,
          productId,
          page: nextPage,
          limit: REVIEW_PHOTOS_PER_PAGE,
        });
        if (generation !== generationRef.current) return;
        const urls = data.items.map((photo) => photo.imageUrl);
        setImages((prev) => (nextPage === 1 ? urls : [...prev, ...urls]));
        setTotal(data.total);
        setPage(nextPage);
      } catch {
        if (generation === generationRef.current && nextPage === 1) {
          setImages([]);
          setTotal(0);
        }
      } finally {
        if (generation === generationRef.current) loadingRef.current = false;
      }
    },
    [planId, productId],
  );

  useEffect(() => {
    generationRef.current += 1;
    loadingRef.current = false;
    setImages([]);
    setTotal(0);
    setPage(0);
    fetchPage(1);
  }, [fetchPage]);

  const hasMore = images.length < total;

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    fetchPage(page + 1);
  }, [fetchPage, hasMore, page]);

  return { images, total, hasMore, loadMore };
}
