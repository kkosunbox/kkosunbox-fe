import { ReviewWriteSection } from "@/widgets/mypage";

export const metadata = { title: "리뷰쓰기 | 꼬순박스" };

export default async function ReviewWritePage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId: planIdStr } = await searchParams;
  const parsed = planIdStr ? Number(planIdStr) : NaN;
  const planId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;

  return <ReviewWriteSection planId={planId} />;
}
