"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RecommendSection } from "@/widgets/subscribe/recommend";
import type { RecommendedTier } from "@/widgets/subscribe/recommend";

const VALID_TIERS: RecommendedTier[] = ["basic", "standard", "premium"];

function isValidTier(value: string | null): value is RecommendedTier {
  return VALID_TIERS.includes(value as RecommendedTier);
}

function RecommendContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tier = searchParams.get("tier");
  const petName = searchParams.get("petName") ?? "우리 아이";

  useEffect(() => {
    if (!isValidTier(tier)) {
      router.replace("/subscribe");
    }
  }, [tier, router]);

  if (!isValidTier(tier)) return null;

  return <RecommendSection recommendedTier={tier} petName={petName} />;
}

export default function RecommendPage() {
  return (
    <div className="pt-[54px]">
      <Suspense fallback={null}>
        <RecommendContent />
      </Suspense>
    </div>
  );
}
