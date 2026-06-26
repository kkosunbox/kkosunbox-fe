import { redirect } from "next/navigation";
import { getAuthUser } from "@/features/auth/lib/session";
import ChecklistResultSection from "@/widgets/checklist/ui/ChecklistResultSection";
import type { RecommendedTier } from "@/widgets/checklist/ui/types";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "맞춤 추천 결과 | 꼬순박스",
  ...NOINDEX_METADATA,
};

const VALID_TIERS = new Set<string>(["basic", "standard", "premium"]);

export default async function ChecklistResultPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/login?next=/checklist/result");
  }

  const params = await searchParams;
  const tier: RecommendedTier = VALID_TIERS.has(params.tier ?? "")
    ? (params.tier as RecommendedTier)
    : "basic";

  return <ChecklistResultSection tier={tier} />;
}
