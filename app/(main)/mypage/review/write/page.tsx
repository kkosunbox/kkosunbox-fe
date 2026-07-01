import dynamic from "next/dynamic";

const ReviewWriteSection = dynamic(
  () => import("@/widgets/mypage/ui/ReviewWriteSection"),
);

export const metadata = { title: "리뷰쓰기 | 꼬순박스" };

function toPositiveInt(value: string | undefined): number | null {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default async function ReviewWritePage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; reviewId?: string }>;
}) {
  const { planId: planIdStr, reviewId: reviewIdStr } = await searchParams;
  const planId = toPositiveInt(planIdStr);
  const reviewId = toPositiveInt(reviewIdStr);

  return <ReviewWriteSection planId={planId} reviewId={reviewId} />;
}
