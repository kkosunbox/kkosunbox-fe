"use client";

import { useEffect, useState } from "react";
import { getReviews } from "@/features/review/api";

/**
 * 플랜별 리뷰 평균 평점 조회.
 * 각 planId에 대해 `getReviews(id, 1, 1)`로 averageRating만 가져와 맵으로 반환한다.
 * 실패 시 해당 플랜은 0으로 처리한다.
 */
export function usePlanRatings(planIds: number[]): Record<number, number> {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const key = planIds.join(",");

  useEffect(() => {
    if (planIds.length === 0) return;
    let cancelled = false;

    Promise.all(
      planIds.map((id) =>
        getReviews(id, 1, 1)
          .then((res) => [id, res.averageRating] as const)
          .catch(() => [id, 0] as const),
      ),
    ).then((entries) => {
      if (cancelled) return;
      setRatings(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return ratings;
}
