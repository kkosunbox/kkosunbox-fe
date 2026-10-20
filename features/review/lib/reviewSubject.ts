import type { StaticImageData } from "next/image";
import { packageThemeForPlan, TIER_BOX_IMAGES, type SubscriptionPlanLike } from "@/entities/package";
import type { ReviewResponse } from "../api/types";

const REVIEW_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** 리뷰 모달 상단에 보여줄 리뷰 대상 정보 */
export interface ReviewSubject {
  name: string;
  thumbnail: StaticImageData | string | null;
  /** 이름 아래 구매 유형 문구 (예: "정기구독", "스토어 구매 · 2026.10.11 주문") */
  caption: string;
}

/** 작성 후 24시간 이내인지 — 서버 수정 가능 기간과 같은 기준 */
export function isReviewEditable(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  return Number.isFinite(created) && Date.now() - created <= REVIEW_EDIT_WINDOW_MS;
}

/** "2026.03.28" 형식 */
export function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10).replace(/-/g, ".");
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 리뷰 응답으로 모달 대상 정보를 만든다.
 * 구독 플랜·스토어 상품 모두 이미지 + 이름 + 구매 유형 문구 형식으로 맞춘다.
 * 구독 플랜은 플랜(없으면 등급 박스) 이미지, 스토어 상품은 상품 이미지와 주문일을 쓴다.
 */
export function buildReviewSubject(
  review: ReviewResponse,
  fallback: { plan?: SubscriptionPlanLike | null; productName?: string | null; imageUrl?: string | null } = {},
): ReviewSubject {
  if (review.planId !== null) {
    const plan: SubscriptionPlanLike = fallback.plan ?? {
      id: review.planId,
      name: review.plan?.name ?? "",
      slug: review.plan?.slug,
      sortOrder: 0,
    };
    const theme = packageThemeForPlan(plan);
    return {
      name: plan.name || review.plan?.name || "",
      thumbnail: plan.imageUrl ?? fallback.imageUrl ?? TIER_BOX_IMAGES[theme.tier],
      caption: "정기구독",
    };
  }
  return {
    name: review.product?.name ?? fallback.productName ?? "스토어 상품",
    thumbnail: review.product?.imageUrl ?? fallback.imageUrl ?? null,
    caption: review.orderedAt ? `스토어 구매 · ${formatReviewDate(review.orderedAt)} 주문` : "스토어 구매",
  };
}
